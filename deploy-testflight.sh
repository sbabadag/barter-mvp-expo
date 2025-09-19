#!/bin/bash

echo "🚀 ESKICI - TestFlight Deployment Script"
echo "========================================="
echo ""

echo "📋 Current Status Check..."
echo ""

# Check current version
echo "📱 Checking app.json version..."
grep '"version":' app.json

echo ""
echo "🔨 Building and Submitting to TestFlight..."
echo ""

# Build for iOS
echo "⏳ Starting iOS production build..."
eas build --platform ios --profile production --non-interactive

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""

# Submit to TestFlight
echo "📲 Submitting to TestFlight..."
eas submit --platform ios --latest --non-interactive

if [ $? -ne 0 ]; then
    echo "❌ Submission failed! The build might already exist."
    echo "💡 Try incrementing the build number in app.json"
    exit 1
fi

echo ""
echo "🎉 Successfully submitted to TestFlight!"
echo ""
echo "📱 Next steps:"
echo "1. Go to App Store Connect: https://appstoreconnect.apple.com"
echo "2. Navigate to TestFlight section"
echo "3. Add internal testers"
echo "4. Create external test group (if needed)"
echo "5. Test the app thoroughly"
echo ""
echo "⏰ Processing time: 10-30 minutes for TestFlight availability"
echo ""
    else
        echo "✅ EAS CLI found"
    fi
}

# Function to build for iOS
build_ios() {
    echo "📦 Building iOS app for production..."
    eas build --platform ios --profile production --non-interactive
    
    if [ $? -eq 0 ]; then
        echo "✅ iOS build completed successfully!"
        return 0
    else
        echo "❌ iOS build failed!"
        return 1
    fi
}

# Function to submit to App Store Connect
submit_to_appstore() {
    echo "📤 Submitting to App Store Connect..."
    eas submit --platform ios --profile production --non-interactive
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully submitted to App Store Connect!"
        echo "🧪 Your app will be available in TestFlight in 10-30 minutes"
        echo "📱 Check App Store Connect: https://appstoreconnect.apple.com"
    else
        echo "❌ Submission failed!"
        return 1
    fi
}

# Function to check build status
check_build_status() {
    echo "📊 Checking build status..."
    eas build:list --platform ios --limit 1
}

# Main execution
main() {
    echo "Starting deployment process..."
    
    # Check prerequisites
    check_eas_cli
    
    # Show current build status
    check_build_status
    
    echo ""
    echo "🤔 What would you like to do?"
    echo "1) Build iOS app"
    echo "2) Submit to App Store Connect"
    echo "3) Check build status"
    echo "4) Full deployment (build + submit)"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            build_ios
            ;;
        2)
            submit_to_appstore
            ;;
        3)
            check_build_status
            ;;
        4)
            if build_ios; then
                submit_to_appstore
            fi
            ;;
        *)
            echo "❌ Invalid choice"
            ;;
    esac
}

# Run the script
main