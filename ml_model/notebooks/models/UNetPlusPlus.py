# 3. Define the UNet++ model (same as in your original message)
import torch
import torch.nn as nn
import torch.nn.functional as F
class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.double_conv(x)

class UNetPlusPlus(nn.Module):
    def __init__(self, in_channels=1, out_channels=3, filters=[32, 64, 128, 256, 512]):
        super().__init__()
        self.conv0_0 = ConvBlock(in_channels, filters[0])
        self.pool0 = nn.MaxPool2d(2)
        self.conv1_0 = ConvBlock(filters[0], filters[1])
        self.pool1 = nn.MaxPool2d(2)
        self.conv2_0 = ConvBlock(filters[1], filters[2])
        self.pool2 = nn.MaxPool2d(2)
        self.conv3_0 = ConvBlock(filters[2], filters[3])
        self.pool3 = nn.MaxPool2d(2)
        self.conv4_0 = ConvBlock(filters[3], filters[4])

        self.up1_0 = nn.ConvTranspose2d(filters[1], filters[0], kernel_size=2, stride=2)
        self.conv0_1 = ConvBlock(filters[0]*2, filters[0])
        self.up2_0 = nn.ConvTranspose2d(filters[2], filters[1], kernel_size=2, stride=2)
        self.conv1_1 = ConvBlock(filters[1]*2, filters[1])
        self.up3_0 = nn.ConvTranspose2d(filters[3], filters[2], kernel_size=2, stride=2)
        self.conv2_1 = ConvBlock(filters[2]*2, filters[2])
        self.up4_0 = nn.ConvTranspose2d(filters[4], filters[3], kernel_size=2, stride=2)
        self.conv3_1 = ConvBlock(filters[3]*2, filters[3])

        self.up1_1 = nn.ConvTranspose2d(filters[1], filters[0], kernel_size=2, stride=2)
        self.conv0_2 = ConvBlock(filters[0]*3, filters[0])
        self.up2_1 = nn.ConvTranspose2d(filters[2], filters[1], kernel_size=2, stride=2)
        self.conv1_2 = ConvBlock(filters[1]*3, filters[1])
        self.up3_1 = nn.ConvTranspose2d(filters[3], filters[2], kernel_size=2, stride=2)
        self.conv2_2 = ConvBlock(filters[2]*3, filters[2])

        self.final_conv = nn.Conv2d(filters[0], out_channels, kernel_size=1)

    def forward(self, x):
        x0_0 = self.conv0_0(x)
        x1_0 = self.conv1_0(self.pool0(x0_0))
        x2_0 = self.conv2_0(self.pool1(x1_0))
        x3_0 = self.conv3_0(self.pool2(x2_0))
        x4_0 = self.conv4_0(self.pool3(x3_0))

        x3_1 = self.conv3_1(torch.cat([self.up4_0(x4_0), x3_0], 1))
        x2_1 = self.conv2_1(torch.cat([self.up3_0(x3_0), x2_0], 1))
        x1_1 = self.conv1_1(torch.cat([self.up2_0(x2_0), x1_0], 1))
        x0_1 = self.conv0_1(torch.cat([self.up1_0(x1_0), x0_0], 1))

        x2_2 = self.conv2_2(torch.cat([self.up3_1(x3_1), x2_0, x2_1], 1))
        x1_2 = self.conv1_2(torch.cat([self.up2_1(x2_1), x1_0, x1_1], 1))
        x0_2 = self.conv0_2(torch.cat([self.up1_1(x1_1), x0_0, x0_1], 1))

        return self.final_conv(x0_2)

