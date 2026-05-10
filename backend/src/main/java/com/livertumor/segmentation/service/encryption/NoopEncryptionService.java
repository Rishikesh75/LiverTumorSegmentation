package com.livertumor.segmentation.service.encryption;

import org.springframework.stereotype.Service;

@Service
public class NoopEncryptionService implements EncryptionService {

    @Override
    public byte[] maybeEncrypt(byte[] plain) {
        return plain;
    }

    @Override
    public byte[] maybeDecrypt(byte[] stored) {
        return stored;
    }
}
