import gc
import logging

import numpy as np
from skimage.transform import resize
from pathlib import Path
from config.config import MODELS_DIR, OUTPUT_DIR, VALID_MODELS
import nibabel as nib

logger = logging.getLogger(__name__)


class ModelService:
    def validate_model_type(self, model_type: str) -> None:
        if model_type not in VALID_MODELS:
            raise ValueError(f"Invalid model type. Must be one of: {VALID_MODELS}")

    def list_available_models(self) -> list[str]:
        return VALID_MODELS

    def load_model(self, model_type: str):
        """
        Load the specified model.
        Replace this with your actual model loading logic.
        """
        logger.info(f"Loading {model_type} model...")

        model_paths = {
            "unet": MODELS_DIR / "unet_model.h5",
            "unet++": MODELS_DIR / "unet_plus_plus_model.h5",
            "attention": MODELS_DIR / "attention_model.h5",
            "trans-unet": MODELS_DIR / "trans_unet_model.h5",
            "ensemble": MODELS_DIR / "ensemble_weights.pkl",
        }

        # TODO: Load actual model
        # Example for TensorFlow/Keras:
        # if model_type in model_paths and model_paths[model_type].exists():
        #     from tensorflow import keras
        #     model = keras.models.load_model(str(model_paths[model_type]))
        #     return model

        logger.warning(f"Model loading not implemented yet for {model_type}")
        return None

    def infer(self, model, image):
        """
        Perform model inference.
        Replace with your actual inference logic.
        """
        logger.info("Performing inference...")

        # TODO: Implement actual inference
        # Example:
        # prediction = model.predict(np.expand_dims(image, axis=0))
        # return prediction[0]

        return image
    
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


