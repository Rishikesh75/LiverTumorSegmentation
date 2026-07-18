###Model
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class PatchEmbedding(nn.Module):
    def __init__(self, img_size=128, patch_size=16, in_channels=1, embed_dim=768):
        super().__init__()
        self.patch_size = patch_size
        self.n_patches = (img_size // patch_size) ** 2
        self.proj = nn.Conv2d(in_channels, embed_dim, kernel_size=patch_size, stride=patch_size)
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.pos_embed = nn.Parameter(torch.randn(1, self.n_patches + 1, embed_dim))

    def forward(self, x):
        B = x.shape[0]
        x = self.proj(x)  # (B, embed_dim, H/P, W/P)
        x = x.flatten(2).transpose(1, 2)  # (B, n_patches, embed_dim)
        cls_tokens = self.cls_token.expand(B, -1, -1)  # (B, 1, embed_dim)
        x = torch.cat((cls_tokens, x), dim=1)  # (B, n_patches+1, embed_dim)
        x = x + self.pos_embed
        return x

class TransformerEncoder(nn.Module):
    def __init__(self, embed_dim=768, depth=4, num_heads=8, mlp_ratio=4.):
        super().__init__()
        self.layers = nn.ModuleList([
            nn.TransformerEncoderLayer(d_model=embed_dim, nhead=num_heads, dim_feedforward=int(embed_dim*mlp_ratio), batch_first=True)
            for _ in range(depth)
        ])

    def forward(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

class TransUNet(nn.Module):
    def __init__(self, img_size=128, patch_size=16, in_channels=1, out_channels=3, embed_dim=768):
        super().__init__()
        self.patch_embed = PatchEmbedding(img_size, patch_size, in_channels, embed_dim)
        self.transformer = TransformerEncoder(embed_dim=embed_dim)

        self.decoder_dim = 256
        self.linear_decoder = nn.Sequential(
            nn.Linear(embed_dim, self.decoder_dim),
            nn.ReLU(inplace=True)
        )

        self.upsample = nn.Sequential(
            nn.ConvTranspose2d(self.decoder_dim, 128, kernel_size=2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(32, out_channels, kernel_size=2, stride=2),
        )

    def forward(self, x):
        B = x.size(0)
        x = self.patch_embed(x)  # (B, n_patches+1, embed_dim)
        x = self.transformer(x)  # (B, n_patches+1, embed_dim)
        x = x[:, 1:, :]  # Remove cls token, shape: (B, n_patches, embed_dim)

        # Reshape to 2D feature map
        h = w = int(math.sqrt(x.shape[1]))
        x = self.linear_decoder(x)  # (B, n_patches, decoder_dim)
        x = x.permute(0, 2, 1).contiguous().view(B, self.decoder_dim, h, w)  # (B, decoder_dim, H, W)

        x = self.upsample(x)  # (B, out_channels, 128, 128)
        return x