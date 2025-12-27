# ML Models Directory

Place your trained models in this directory.

## Expected Models

- `unet_model.h5` - UNet model for liver tumor segmentation
- `unet_plus_plus_model.h5` - UNet++ model
- `attention_model.h5` - Attention UNet model
- `trans_unet_model.h5` - Trans-UNet model
- `ensemble_weights.pkl` - Ensemble model weights

## Model Format

- **TensorFlow/Keras**: `.h5` or `.keras` format
- **PyTorch**: `.pt` or `.pth` format
- **ONNX**: `.onnx` format
- **Pickle**: `.pkl` format (for ensemble weights)

## Loading Models

Models are loaded in `ml-service/app.py` in the `load_model()` function.
Update this function based on your model format and framework.

## Git LFS (Recommended for Large Models)

Since model files are typically large (>100MB), consider using Git LFS:

```bash
# Install Git LFS
git lfs install

# Track model files
git lfs track "*.h5"
git lfs track "*.pkl"
git lfs track "*.pt"

# Add and commit
git add .gitattributes
git commit -m "Track model files with Git LFS"
```

## Alternative: Model Storage

For production, consider storing models in:
- AWS S3
- Azure Blob Storage
- Google Cloud Storage
- Docker volumes
- Shared network storage

## Training

Training notebooks are in `training/notebooks/` directory.
After training, export your models and place them here.

