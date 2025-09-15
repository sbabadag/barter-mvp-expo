#!/bin/bash

echo "🚀 ESKICI iOS TestFlight Deployment Script"
echo "============================================"

# Function to check if EAS CLI is installed
check_eas_cli() {
    if ! command -v eas &> /dev/null; then
        echo "❌ EAS CLI not found. Installing..."
        npm install -g @expo/eas-cli
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