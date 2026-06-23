import Phaser from 'phaser';

const clampVolume = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Phaser.Math.Clamp(parsed, 0, 1);
};

const patchSoundPrototype = (SoundClass) => {
  const proto = SoundClass?.prototype;
  if (!proto || proto.__buioSafeVolumePatchInstalled) {
    return;
  }

  proto.__buioSafeVolumePatchInstalled = true;

  const descriptor = Object.getOwnPropertyDescriptor(proto, 'volume');
  const originalSetVolume = proto.setVolume;

  Object.defineProperty(proto, 'volume', {
    configurable: true,
    enumerable: descriptor?.enumerable ?? true,
    get() {
      if (typeof this.__buioSafeVolume === 'number') {
        return this.__buioSafeVolume;
      }

      try {
        const value = descriptor?.get?.call(this);
        if (Number.isFinite(value)) {
          this.__buioSafeVolume = value;
          return value;
        }
      } catch {
        // WebAudio gain node can be null before the audio context is unlocked.
      }

      this.__buioSafeVolume = 1;
      return 1;
    },
    set(value) {
      const safeValue = clampVolume(value);
      this.__buioSafeVolume = safeValue;

      try {
        if (descriptor?.set) {
          descriptor.set.call(this, safeValue);
          return;
        }
      } catch {
        // Keep the cached value and avoid crashing the render/update loop.
      }

      try {
        if (typeof originalSetVolume === 'function') {
          originalSetVolume.call(this, safeValue);
        }
      } catch {
        // If the native setter is not ready yet, the cached volume will be enough for tweens.
      }
    }
  });

  if (typeof originalSetVolume === 'function') {
    proto.setVolume = function safeSetVolume(value) {
      const safeValue = clampVolume(value);
      this.__buioSafeVolume = safeValue;
      try {
        return originalSetVolume.call(this, safeValue);
      } catch {
        return this;
      }
    };
  }
};

patchSoundPrototype(Phaser.Sound?.WebAudioSound);
patchSoundPrototype(Phaser.Sound?.HTML5AudioSound);
patchSoundPrototype(Phaser.Sound?.NoAudioSound);
