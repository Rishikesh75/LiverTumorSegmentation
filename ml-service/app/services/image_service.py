import logging
import os
import gc
from pathlib import Path

import nibabel as nib
import numpy as np
from skimage.transform import resize

from config.config import OUTPUT_DIR, UPLOAD_DIR

logger = logging.getLogger(__name__)


class ImageService:
    def get_input_path(self, image_path: str) -> Path:
        input_path = UPLOAD_DIR / image_path
        if not input_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")
        return input_path

    def load_volume(self, image_path: Path):
        logger.info(f"Loading volume: {image_path}")
        # Disable memmap on Windows to avoid mmap allocation failures (WinError 8).
        image = nib.load(str(image_path), mmap=False)
        try:
            volume = image.get_fdata(dtype=np.float32)
        except OSError as exc:
            logger.warning(
                "get_fdata failed (%s). Falling back to array proxy loading.",
                exc,
            )
            # Fallback path for environments where a single allocation can fail.
            volume = np.asarray(image.dataobj, dtype=np.float32)
        return image, volume

    def preprocess(self, volume: np.ndarray) -> np.ndarray:
        """
        Preprocess the input volume for model inference.
        This normalizes intensity values and resizes slices to the model's expected size.
        """
        logger.info("Preprocessing volume")

        volume = np.asarray(volume, dtype=np.float32)

        # Simple normalization by percentile clipping for medical scans.
        if volume.size > 0:
            lower = np.percentile(volume, 1)
            upper = np.percentile(volume, 99)
            volume = np.clip(volume, lower, upper)
            volume = (volume - lower) / (upper - lower + 1e-6)

        # Resize to a manageable 2D slice size expected by the segmentation model.
        if volume.ndim == 3:
            resized_slices = [
                resize(slice_2d, (128, 128), mode="constant", preserve_range=True)
                for slice_2d in volume.transpose(2, 0, 1)
            ]
            volume = np.stack(resized_slices, axis=0).transpose(1, 2, 0).astype(np.float32)
        elif volume.ndim == 2:
            volume = resize(volume, (128, 128), mode="constant", preserve_range=True).astype(
                np.float32
            )

        return volume

    def postprocess(self, prediction: np.ndarray, original_shape: tuple[int, ...]) -> np.ndarray:
        """
        Postprocess the model output and resize it back to the original volume shape.
        """
        logger.info("Postprocessing result...")

        prediction = np.asarray(prediction)

        if prediction.ndim > len(original_shape):
            prediction = np.squeeze(prediction)

        if prediction.shape != original_shape:
            # Resize slice-by-slice to reduce peak memory usage on large 3D volumes.
            if prediction.ndim == 3 and len(original_shape) == 3:
                original_h, original_w, original_d = original_shape
                pred_h, pred_w, pred_d = prediction.shape
                if pred_d != original_d:
                    raise ValueError(
                        "Prediction depth does not match original depth: "
                        f"{pred_d} != {original_d}"
                    )

                resized_prediction = np.empty(original_shape, dtype=np.float32)
                for idx in range(original_d):
                    resized_prediction[:, :, idx] = resize(
                        prediction[:, :, idx],
                        (original_h, original_w),
                        order=0,
                        mode="edge",
                        anti_aliasing=False,
                        preserve_range=True,
                    ).astype(np.float32)

                prediction = resized_prediction
            else:
                # Fallback for non-3D shapes.
                prediction = resize(
                    prediction,
                    original_shape,
                    order=0,
                    mode="edge",
                    anti_aliasing=False,
                    preserve_range=True,
                ).astype(np.float32)

        if prediction.dtype != np.uint8:
            prediction = np.clip(prediction, 0, 1)
            prediction = (prediction * 255).astype(np.uint8)

        return prediction

    def save_segmentation_result(
        self,
        result: np.ndarray,
        model_type: str,
        source_path: Path,
        original_image: nib.Nifti1Image,
    ) -> str:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_filename = (
            f"segmented_{model_type}_{Path(source_path).stem}_{os.urandom(4).hex()}.nii.gz"
        )
        output_path = OUTPUT_DIR / output_filename

        # Preserve affine/orientation metadata for the output file.
        output_image = nib.Nifti1Image(
            np.asarray(result, dtype=np.uint8),
            affine=original_image.affine,
            header=original_image.header,
        )
        nib.save(output_image, str(output_path))
        del output_image
        gc.collect()

        logger.info(f"Segmentation result saved: {output_filename}")
        return str(output_path)

    def resolve_image_path(self, filename: str, image_type: str) -> Path:
        if image_type == "upload":
            file_path = UPLOAD_DIR / filename
        else:
            file_path = OUTPUT_DIR / filename

        if not file_path.exists():
            raise FileNotFoundError("Image not found")

        return file_path
