#!/bin/bash

# Fix iOS build configuration for Firebase Swift pods
echo "🔧 Fixing iOS Podfile for Firebase Swift compatibility..."

# Create the ios directory if it doesn't exist
mkdir -p ios

# Add post_install hook to handle modular headers
cat >> ios/Podfile << 'EOF'

post_install do |installer|
  # Fix for Firebase Swift pods compatibility
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
      config.build_settings['SWIFT_VERSION'] = '5.0'
    end
  end
  
  # Enable modular headers globally
  installer.pods_project.build_configurations.each do |config|
    config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
  end
end
EOF

echo "✅ iOS build configuration updated"