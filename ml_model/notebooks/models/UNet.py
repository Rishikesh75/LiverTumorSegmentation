import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model # type: ignore
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, UpSampling2D, Concatenate # type: ignore
from tensorflow.keras.utils import to_categorical # type: ignore
from tensorflow.keras.losses import categorical_crossentropy # type: ignore
import tensorflow.keras.backend as K # type: ignore
from skimage.transform import resize
import nibabel as nib
import matplotlib.pyplot as plt


class UNet:
    def __init__(self, input_size=(128, 128, 1), num_classes=3):
        self.input_size = input_size
        self.num_classes = num_classes
        self.model = self.unet_model(input_size, num_classes)
        self.model.compile(optimizer='adam', loss=self.dice_loss, metrics=[self.dice_coefficient])

    def train(self, X_train, y_train, batch_size=16, epochs=50):
        y_train_cat = to_categorical(y_train, num_classes=self.num_classes)
        self.model.fit(X_train, y_train_cat, batch_size=batch_size, epochs=epochs)

    def predict(self, X):
        predictions = self.model.predict(X)
        return np.argmax(predictions, axis=-1)

    # ---- Dice Coefficient and Loss ----
    @staticmethod
    def dice_coefficient(y_true, y_pred, smooth=1):
        """Calculate Dice coefficient."""
        y_true = K.cast(y_true, "float32")
        y_pred = K.cast(y_pred, "float32")
        y_true_f = K.flatten(y_true)
        y_pred_f = K.flatten(y_pred)
        intersection = K.sum(y_true_f * y_pred_f)
        return (2. * intersection + smooth) / (K.sum(y_true_f) + K.sum(y_pred_f) + smooth)

    @staticmethod
    def dice_loss(y_true, y_pred):
        return 1 - UNet.dice_coefficient(y_true, y_pred)

    # ---- U-Net Model ----
    @staticmethod
    def unet_model(input_size=(128, 128, 1), num_classes=3):
        inputs = Input(input_size)

        # Encoder
        c1 = Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
        c1 = Conv2D(32, (3, 3), activation='relu', padding='same')(c1)
        p1 = MaxPooling2D((2, 2))(c1)

        c2 = Conv2D(64, (3, 3), activation='relu', padding='same')(p1)
        c2 = Conv2D(64, (3, 3), activation='relu', padding='same')(c2)
        p2 = MaxPooling2D((2, 2))(c2)

        # Bottleneck
        c3 = Conv2D(128, (3, 3), activation='relu', padding='same')(p2)
        c3 = Conv2D(128, (3, 3), activation='relu', padding='same')(c3)

        # Decoder
        u1 = UpSampling2D((2, 2))(c3)
        u1 = Concatenate()([u1, c2])
        c4 = Conv2D(64, (3, 3), activation='relu', padding='same')(u1)
        c4 = Conv2D(64, (3, 3), activation='relu', padding='same')(c4)

        u2 = UpSampling2D((2, 2))(c4)
        u2 = Concatenate()([u2, c1])
        c5 = Conv2D(32, (3, 3), activation='relu', padding='same')(u2)
        c5 = Conv2D(32, (3, 3), activation='relu', padding='same')(c5)

        # Output Layer (Softmax for Multi-Class)
        outputs = Conv2D(num_classes, (1, 1), activation='softmax')(c5)

        model = Model(inputs, outputs)
        return model
    
    @staticmethod
    def iou_coefficient(y_true, y_pred, smooth=1):
        """Calculate the Intersection over Union (IoU) for binary mask."""
        y_true = K.cast(y_true, "float32")
        y_pred = K.cast(y_pred, "float32")
        y_true_f = K.flatten(y_true)
        y_pred_f = K.flatten(y_pred)
        intersection = K.sum(y_true_f * y_pred_f)
        union = K.sum(y_true_f) + K.sum(y_pred_f) - intersection
        return (intersection + smooth) / (union + smooth)

    @staticmethod
    def precision(y_true, y_pred):
        y_true = K.cast(y_true, "float32")
        y_pred = K.cast(y_pred, "float32")
        y_true_f = K.flatten(y_true)
        y_pred_f = K.flatten(y_pred)
        tp = K.sum(y_true_f * y_pred_f)
        fp = K.sum(y_pred_f) - tp
        return tp / (tp + fp + K.epsilon())

    @staticmethod
    def recall(y_true, y_pred):
        y_true = K.cast(y_true, "float32")
        y_pred = K.cast(y_pred, "float32")
        y_true_f = K.flatten(y_true)
        y_pred_f = K.flatten(y_pred)
        tp = K.sum(y_true_f * y_pred_f)
        fn = K.sum(y_true_f) - tp
        return tp / (tp + fn + K.epsilon())

    @staticmethod
    def f1_score(y_true, y_pred):
        prec = UNet.precision(y_true, y_pred)
        rec = UNet.recall(y_true, y_pred)
        return 2 * (prec * rec) / (prec + rec + K.epsilon())
