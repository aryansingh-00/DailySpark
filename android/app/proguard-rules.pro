# Add project specific ProGuard rules here.
# For R8 code shrinking and optimization

# Suppress missing class warnings from Kotlin & Capacitor plugins
-dontwarn kotlin.coroutines.jvm.internal.SpillingKt
-dontwarn kotlin.**
-dontwarn com.capacitorjs.plugins.**
-dontwarn com.getcapacitor.**

# Preserve Capacitor Native JS interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.community.admob.** { *; }

# Preserve Google Mobile Ads SDK / AdMob
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }

# Preserve WebView Javascript interfaces & native methods
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepattributes SourceFile,LineNumberTable

# Preserve AndroidX & Native components
-keep class androidx.appcompat.** { *; }
-keep class androidx.coordinatorlayout.** { *; }
