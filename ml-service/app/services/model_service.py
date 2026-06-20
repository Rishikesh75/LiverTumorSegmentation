import logging

from config.config import MODELS_DIR, VALID_MODELS

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
