# Capacitor Integration Guide

**Tanggal:** 6 November 2025  
**Target Platform:** Android  
**Capacitor Version:** 6.x

## 📋 Overview

Panduan lengkap untuk mengintegrasikan Budget Tracker app dengan Capacitor dan build sebagai Android native app dengan gesture support.

---

## 🚀 Initial Setup

### Step 1: Install Capacitor

```bash
# Install Capacitor CLI and core
npm install @capacitor/cli @capacitor/core

# Install required plugins
npm install @capacitor/app @capacitor/haptics

# Optional plugins
npm install @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
```

### Step 2: Initialize Capacitor

```bash
# Initialize Capacitor config
npx cap init

# Prompts:
# App name: Budget Tracker
# App ID: com.budgettracker.app (or your package name)
# Web directory: dist (or build, depending on your setup)
```

This creates `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgettracker.app',
  appName: 'Budget Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    },
    Keyboard: {
      resize: 'native',
      style: 'dark'
    }
  }
};

export default config;
```

### Step 3: Add Android Platform

```bash
# Add Android platform
npx cap add android

# This creates:
# - /android directory
# - Android Studio project
# - Gradle files
```

---

## 🔧 Configuration

### Update capacitor.config.ts

**File:** `/capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgettracker.app',
  appName: 'Budget Tracker',
  webDir: 'dist',
  
  server: {
    androidScheme: 'https',
    // For development: connect to local server
    // url: 'http://192.168.1.100:5173', // Your local IP
    // cleartext: true
  },

  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  },

  plugins: {
    // App Plugin - for back button
    App: {
      // No specific config needed
    },

    // Haptics - for vibration
    Haptics: {
      // No specific config needed
    },

    // Status Bar
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    },

    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },

    // Keyboard
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true
    }
  }
};

export default config;
```

### Update package.json Scripts

**File:** `/package.json`

Add these scripts:

```json
{
  "scripts": {
    "build": "vite build",
    "cap:sync": "cap sync",
    "cap:build": "npm run build && cap sync",
    "cap:open:android": "cap open android",
    "cap:run:android": "npm run cap:build && cap run android",
    "android:dev": "npm run build && npx cap sync && npx cap run android",
    "android:build": "npm run build && npx cap sync && npx cap open android"
  }
}
```

---

## 📱 Android Configuration

### Update AndroidManifest.xml

**File:** `/android/app/src/main/AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
```

### Update MainActivity.java

**File:** `/android/app/src/main/java/com/budgettracker/app/MainActivity.java`

```java
package com.budgettracker.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}
```

### Update build.gradle (app level)

**File:** `/android/app/build.gradle`

```gradle
apply plugin: 'com.android.application'

android {
    namespace "com.budgettracker.app"
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.budgettracker.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-android')
    implementation project(':capacitor-app')
    implementation project(':capacitor-haptics')
    // Add other plugin dependencies here
}
```

---

## 🎨 Assets & Branding

### App Icons

Generate icons using a tool like [Icon Kitchen](https://icon.kitchen/) or manually create:

**Required sizes:**
```
/android/app/src/main/res/
  mipmap-mdpi/ic_launcher.png (48x48)
  mipmap-hdpi/ic_launcher.png (72x72)
  mipmap-xhdpi/ic_launcher.png (96x96)
  mipmap-xxhdpi/ic_launcher.png (144x144)
  mipmap-xxxhdpi/ic_launcher.png (192x192)
```

### Splash Screen

**File:** `/android/app/src/main/res/drawable/splash.png`

Create splash screen image (2732x2732 recommended, will be centered)

**File:** `/android/app/src/main/res/values/styles.xml`

```xml
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
```

---

## 🔨 Build Process

### Development Build

```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npx cap sync

# 3. Open in Android Studio
npx cap open android

# 4. Run from Android Studio (recommended)
# - Connect device or start emulator
# - Click "Run" button
```

### Production Build

```bash
# 1. Update version in package.json
# 2. Update versionCode and versionName in build.gradle
# 3. Build optimized web assets
npm run build

# 4. Sync with Capacitor
npx cap sync

# 5. Open Android Studio
npx cap open android

# 6. In Android Studio:
# Build > Generate Signed Bundle / APK
# - Choose Android App Bundle (.aab) for Play Store
# - Or APK for direct distribution
```

---

## 🧪 Testing

### Development Testing

#### Method 1: USB Debugging

```bash
# Enable USB debugging on device
# 1. Settings > About Phone > Tap "Build Number" 7 times
# 2. Settings > Developer Options > Enable "USB Debugging"
# 3. Connect device to computer

# Build and run
npm run android:dev

# Or manually:
npm run build
npx cap sync
npx cap open android
# Then run from Android Studio
```

#### Method 2: Emulator

```bash
# Create emulator in Android Studio
# Tools > Device Manager > Create Device

# Run
npm run android:dev
```

### Testing Checklist

**Basic Functionality:**
- [ ] App launches successfully
- [ ] All screens load
- [ ] Navigation works
- [ ] Data persists (Supabase connection)

**Gesture Support:**
- [ ] Hardware back button closes dialogs
- [ ] Back button shows exit confirmation
- [ ] Double back exits app
- [ ] Swipe down closes dialogs
- [ ] Smooth animations

**Native Features:**
- [ ] Haptic feedback works
- [ ] Status bar styled correctly
- [ ] Keyboard behavior correct
- [ ] No UI overlaps with notch/status bar

**Performance:**
- [ ] Fast load time
- [ ] Smooth scrolling
- [ ] No lag on interactions
- [ ] Memory usage acceptable

---

## 🐛 Common Issues & Solutions

### Issue 1: Capacitor is not defined

**Symptom:** `window.Capacitor is undefined`

**Solution:**
```tsx
// Always check before using
if (typeof window !== 'undefined' && window.Capacitor) {
  // Use Capacitor features
}
```

### Issue 2: Back button doesn't work

**Symptom:** Hardware back button exits app immediately

**Solution:**
1. Verify App plugin is installed:
   ```bash
   npm install @capacitor/app
   npx cap sync
   ```

2. Check listener is registered:
   ```tsx
   import { App } from '@capacitor/app';
   
   App.addListener('backButton', (event) => {
     console.log('Back button pressed', event);
   });
   ```

### Issue 3: Haptics not working

**Symptom:** No vibration on interactions

**Solution:**
1. Check permission in AndroidManifest.xml:
   ```xml
   <uses-permission android:name="android.permission.VIBRATE" />
   ```

2. Test on real device (may not work in emulator)

3. Check device vibration settings

### Issue 4: White screen on launch

**Symptom:** App shows white screen, then loads

**Solution:**
1. Add splash screen:
   ```bash
   npm install @capacitor/splash-screen
   npx cap sync
   ```

2. Configure in capacitor.config.ts (see above)

### Issue 5: Build fails in Android Studio

**Symptom:** Gradle build errors

**Solution:**
1. Update Gradle:
   - File > Project Structure > Project
   - Update Gradle version

2. Clean build:
   ```bash
   cd android
   ./gradlew clean
   ```

3. Sync Capacitor:
   ```bash
   npx cap sync android
   ```

---

## 📊 Performance Optimization

### 1. Enable ProGuard (Release)

**File:** `/android/app/build.gradle`

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 2. Enable R8 Optimization

**File:** `/android/gradle.properties`

```properties
android.enableR8.fullMode=true
```

### 3. Optimize Web Assets

```bash
# Build with optimizations
npm run build

# Check bundle size
npx vite-bundle-visualizer
```

### 4. Configure WebView

**File:** `MainActivity.java`

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Enable WebView debugging (development only)
    if (BuildConfig.DEBUG) {
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
```

---

## 🔐 Security

### 1. Network Security Config

**File:** `/android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <!-- Only for development -->
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
    
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### 2. Environment Variables

Never commit sensitive data! Use:

**File:** `.env.local` (gitignored)

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Access in code:
```tsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

### 3. Code Obfuscation

Use ProGuard for release builds (see Performance section)

---

## 📦 Distribution

### Google Play Store

1. **Create Release Build:**
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

2. **Generate Signed Bundle:**
   - Build > Generate Signed Bundle / APK
   - Create or use existing keystore
   - Choose release variant
   - Output: `.aab` file

3. **Upload to Play Console:**
   - Create app in Play Console
   - Complete store listing
   - Upload `.aab` file
   - Submit for review

### Direct APK Distribution

1. **Build APK:**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Output: `app-release.apk`

2. **Distribute:**
   - Host on website
   - Email directly
   - Use services like AppCenter

---

## 🔄 Updates & Maintenance

### Live Updates (Optional)

Consider using Capacitor Live Updates for quick fixes without app store approval:

```bash
npm install @capacitor/live-updates
```

### Version Management

**Update version:**
1. `package.json`: Update `version`
2. `android/app/build.gradle`: Update `versionCode` and `versionName`
3. Rebuild and redistribute

---

## 📚 Resources

### Official Documentation
- [Capacitor Docs](https://capacitorjs.com/docs)
- [App Plugin](https://capacitorjs.com/docs/apis/app)
- [Haptics Plugin](https://capacitorjs.com/docs/apis/haptics)
- [Android Guide](https://capacitorjs.com/docs/android)

### Tools
- [Android Studio](https://developer.android.com/studio)
- [Capacitor CLI](https://capacitorjs.com/docs/cli)
- [Icon Kitchen](https://icon.kitchen/)
- [App Screenshot Generator](https://appscreenshots.io/)

### Community
- [Capacitor Discord](https://discord.gg/UPYYRhtyzp)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)

---

## ✅ Final Checklist

Before publishing:

- [ ] All features tested on real device
- [ ] Gestures work correctly
- [ ] No crashes or errors
- [ ] Performance acceptable
- [ ] App icon set
- [ ] Splash screen configured
- [ ] Version numbers updated
- [ ] Signed with release keystore
- [ ] Store listing complete
- [ ] Screenshots prepared
- [ ] Privacy policy ready (if needed)

---

**Status:** Ready for Capacitor integration ✅  
**Last Updated:** 6 November 2025
