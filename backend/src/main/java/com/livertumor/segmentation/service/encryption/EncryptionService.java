package com.livertumor.segmentation.service.encryption;

/**
 * Hook for optional at-rest encryption (no-op unless a KMS-backed implementation is provided).
 */
public interface EncryptionService {

    byte[] maybeEncrypt(byte[] plain);

    byte[] maybeDecrypt(byte[] stored);
}
