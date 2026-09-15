import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';

export const nativeShare = async (text: string, title?: string) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ text, title: title || 'DailySpark Quote', dialogTitle: 'Share with' });
    } else if (navigator.share) {
      await navigator.share({ text, title: title || 'DailySpark Quote' });
    } else {
      await nativeCopy(text);
      toast.success("Quote copied for sharing!", { className: "rounded-2xl" });
    }
  } catch (err) {
    console.error("Share error:", err);
  }
};

export const nativeCopy = async (text: string) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Clipboard.write({ string: text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  } catch (err) {
    console.error("Copy error:", err);
  }
};

export const nativeDownloadImage = async (base64Data: string, filename: string) => {
  try {
    if (Capacitor.isNativePlatform()) {
      const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });

      await Share.share({
        files: [savedFile.uri],
        title: 'Save or Share Affirmation',
        dialogTitle: 'Save or Share Affirmation',
      });
    } else {
      const link = document.createElement("a");
      link.download = filename;
      link.href = base64Data;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err: any) {
    console.error("Download error:", err);
    try {
      const link = document.createElement("a");
      link.download = filename;
      link.href = base64Data;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackErr) {
      toast.error("Could not save image to device.");
    }
  }
};
