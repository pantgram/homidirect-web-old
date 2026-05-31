import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "el";

export type TranslationKey = keyof (typeof translations)["en"];

interface LanguageContextType {
  language: Language;
  locale: string;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const translations = {
  en: {
    // Navigation
    "nav.browse": "Browse Properties",
    "nav.list": "List Your Property",
    "nav.howItWorks": "How It Works",
    "nav.signIn": "Sign In",

    // Hero
    "hero.title": "Find Your Perfect Rental",
    "hero.subtitle":
      "Connect directly with property owners. No agents, no fees.",
    "hero.location": "Location",
    "hero.propertyType": "Property Type",
    "hero.priceRange": "Price Range",
    "hero.search": "Search Properties",
    "hero.apartment": "Apartment",
    "hero.house": "House",
    "hero.studio": "Studio",

    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.welcomeBack": "Welcome Back",
    "auth.loginDesc": "Enter your credentials to access your account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.loginButton": "Login",
    "auth.loggingIn": "Logging in...",
    "auth.createAccount": "Create Account",
    "auth.signupDesc": "Join HomiDirect and start your rental journey",
    "auth.fullName": "Full Name",
    "auth.confirmPassword": "Confirm Password",
    "auth.iAmA": "I am a:",
    "auth.tenant": "Tenant (looking for rental properties)",
    "auth.propertyOwner": "Property Owner (want to list properties)",
    "auth.signUpButton": "Sign Up",
    "auth.creatingAccount": "Creating account...",
    "auth.loginSuccess": "Login successful",
    "auth.welcomeBackMsg": "Welcome back to HomiDirect!",
    "auth.accountCreated": "Account created",
    "auth.welcomeMsg": "Welcome to HomiDirect!",
    "auth.roleRequired": "Role required",
    "auth.roleRequiredMsg":
      "Please select at least one role (Tenant or Property Owner)",
    "auth.error": "Error",
    "auth.loginFailed": "Login failed. Please check your credentials.",
    "auth.signupFailed": "Registration failed. Please try again.",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.passwordTooShort": "Password must be at least 8 characters",
    "auth.forgotPassword": "Forgot Password",
    "auth.forgotPasswordDesc":
      "Enter your email address and we'll send you a link to reset your password.",
    "auth.forgotPasswordLink": "Forgot your password?",
    "auth.sendResetLink": "Send Reset Link",
    "auth.sending": "Sending...",
    "auth.resetLinkSent": "Reset Link Sent",
    "auth.resetLinkSentDesc":
      "If an account exists with this email, you will receive a password reset link.",
    "auth.resetRequestFailed": "Failed to send reset link. Please try again.",
    "auth.checkYourEmail": "Check Your Email",
    "auth.checkYourEmailDesc":
      "We've sent a password reset link to your email address. The link will expire in 1 hour.",
    "auth.tryAnotherEmail": "Try Another Email",
    "auth.backToLogin": "Back to Login",
    "auth.resetPassword": "Reset Password",
    "auth.resetPasswordDesc": "Enter your new password below.",
    "auth.newPassword": "New Password",
    "auth.confirmNewPassword": "Confirm New Password",
    "auth.resetPasswordButton": "Reset Password",
    "auth.resetting": "Resetting...",
    "auth.passwordResetSuccess": "Password Reset Successful",
    "auth.passwordResetSuccessDesc":
      "Your password has been reset. You can now log in with your new password.",
    "auth.goToLogin": "Go to Login",
    "auth.resetFailed": "Failed to reset password. The link may have expired.",
    "auth.invalidResetLink": "Invalid Reset Link",
    "auth.invalidResetLinkDesc":
      "This password reset link is invalid or has expired. Please request a new one.",
    "auth.requestNewLink": "Request New Link",
    "auth.enterToken": "Enter Reset Token",
    "auth.enterTokenDesc": "Enter the token we sent to your email address.",
    "auth.tokenSentTo": "We sent a reset token to",
    "auth.resetToken": "Reset Token",
    "auth.tokenPlaceholder": "Paste your token here",
    "auth.verifyToken": "Continue",
    "auth.resendToken": "Resend Token",
    "auth.tokenRequired": "Please enter the token from your email",
    "auth.back": "Back",
    "auth.googleSignIn": "Sign in with Google",
    "auth.googleSignUp": "Sign up with Google",
    "auth.googleAccountExists": "An account with this email already exists. Please log in with your email and password.",
    "auth.googleAuthFailed": "Google authentication failed. Please try again.",
    "auth.orContinueWith": "or continue with",

    // User Menu
    "userMenu.myListings": "My Listings",
    "userMenu.favorites": "Favorites",
    "userMenu.profile": "Profile",
    "userMenu.settings": "Settings",
    "userMenu.logout": "Log out",

    // List Property Info
    "listInfo.title": "List Your Property on HomiDirect",
    "listInfo.subtitle":
      "Connect with renters directly and save on agent fees. No commission, complete control.",
    "listInfo.noFees": "No Agent Fees",
    "listInfo.noFeesDesc":
      "Keep 100% of your rental income without paying commission",
    "listInfo.setPrice": "Set Your Price",
    "listInfo.setPriceDesc":
      "You control the pricing and terms of your rental property",
    "listInfo.directContact": "Direct Contact",
    "listInfo.directContactDesc":
      "Communicate directly with potential renters instantly",
    "listInfo.howToList": "How to List Your Property",
    "listInfo.howToListDesc":
      "Follow these simple steps to get your property listed",
    "listInfo.step1": "Register as a Property Owner",
    "listInfo.step1Desc":
      'Create an account and select "Property Owner" during registration',
    "listInfo.step2": "Fill Out Property Details",
    "listInfo.step2Desc":
      "Provide accurate information about your property including location, price, and amenities",
    "listInfo.step3": "Upload Photos & Verification",
    "listInfo.step3Desc":
      "Add high-quality photos and upload a verification document (utility bill or title deed)",
    "listInfo.step4": "Connect with Renters",
    "listInfo.step4Desc":
      "Once approved, your property goes live and tenants can contact you directly",
    "listInfo.needRegister":
      "You need to be registered as a Property Owner to list your property",
    "listInfo.tenantAccount":
      "Your account is registered as a Tenant. Please create a new account as a Property Owner to list properties.",
    "listInfo.registerButton": "Register as Property Owner",
    "listInfo.startListing": "Start Listing",

    // List Property Form
    "listForm.title": "List Your Property",
    "listForm.subtitle":
      "Fill in the details below to list your property and connect with renters directly.",
    "listForm.propertyDetails": "Property Details",
    "listForm.propertyDetailsDesc":
      "Provide accurate information to attract quality renters",
    "listForm.propertyTitle": "Property Title",
    "listForm.titlePlaceholder": "e.g., Modern 2BR Apartment in Downtown",
    "listForm.propertyType": "Property Type",
    "listForm.monthlyRent": "Monthly Rent (EUR)",
    "listForm.city": "City",
    "listForm.cityPlaceholder": "e.g., Athens",
    "listForm.address": "Address",
    "listForm.postalCode": "Postal Code",
    "listForm.country": "Country",
    "listForm.bedrooms": "Bedrooms",
    "listForm.bathrooms": "Bathrooms",
    "listForm.area": "Area (m²)",
    "listForm.description": "Description",
    "listForm.descriptionPlaceholder":
      "Describe your property, amenities, nearby facilities...",
    "listForm.propertyImages": "Property Images",
    "listForm.imagesHint":
      "Upload high-quality images of your property. The first image will be the main photo.",
    "listForm.submitButton": "List My Property",
    "listForm.submitting": "Creating listing...",
    "listForm.listed": "Property Listed!",
    "listForm.listedDesc": "Your property has been submitted for review.",
    "listForm.error": "Error",
    "listForm.errorDesc": "Failed to create listing. Please try again.",
    "listForm.accessDenied": "Access Denied",
    "listForm.accessDeniedDesc":
      "You must be registered as a Property Owner to list properties.",
    "listForm.verificationNote":
      "After creating your listing, you will be redirected to upload verification documents.",
    "listForm.types.apartment": "Apartment",
    "listForm.types.house": "House",
    "listForm.types.studio": "Studio",
    "listForm.types.room": "Room",
    "listForm.validation.error": "Validation Error",
    "listForm.validation.fixErrors": "Please fix the errors in the form.",
    "listForm.validation.titleRequired": "Property title is required",
    "listForm.validation.typeRequired": "Property type is required",
    "listForm.validation.priceRequired": "Price must be greater than 0",
    "listForm.validation.cityRequired": "City is required",
    "listForm.validation.addressRequired": "Address is required",
    "listForm.validation.bedroomsRequired": "Number of bedrooms is required",
    "listForm.validation.bathroomsRequired": "Number of bathrooms is required",
    "listForm.validation.areaRequired": "Area must be greater than 0",
    "listForm.validation.imagesRequired": "Images Required",
    "listForm.validation.addImages":
      "Please upload at least one image of your property.",

    // Image Upload Component
    "imageUpload.dragOrClick": "Drag and drop images here, or click to select",
    "imageUpload.supportedFormats": "JPEG, PNG, WebP supported",
    "imageUpload.maxReached": "Maximum number of images reached",
    "imageUpload.imagesUploaded": "images uploaded",
    "imageUpload.uploading": "Uploading...",
    "imageUpload.files": "files",
    "imageUpload.primary": "Primary",
    "imageUpload.noImages": "No images uploaded yet",
    "imageUpload.uploadError": "Upload Error",
    "imageUpload.uploadFailed": "Failed to upload image. Please try again.",
    "imageUpload.invalidType":
      "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    "imageUpload.fileTooLarge": "File is too large. Maximum size is 5MB.",
    "imageUpload.tooManyImages": "Too Many Images",
    "imageUpload.maxImagesReached": "Maximum {max} images allowed.",
    "imageUpload.imageRemoved": "Image Removed",
    "imageUpload.imageRemovedDesc": "The image has been removed.",
    "imageUpload.removeError": "Remove Error",
    "imageUpload.removeFailed": "Failed to remove image. Please try again.",

    // Hero
    "hero.perfectHome": "Find Your Perfect Home",
    "hero.withoutHassle": "Without The Hassle",
    "hero.connectDirectly":
      "Connect directly with property owners. No agents, no extra fees. Just honest rentals.",
    "hero.searchPlaceholder": "Location, neighborhood, or city...",
    "hero.apartments": "Apartments",
    "hero.houses": "Houses",
    "hero.studios": "Studios",
    "hero.room": "Rooms",
    "hero.activeListings": "Active Listings",
    "hero.propertyOwners": "Property Owners",
    "hero.agentFees": "Agent Fees",

    // Property Card
    "propertyCard.perMonth": "per month",
    "propertyCard.beds": "Beds",
    "propertyCard.baths": "Baths",
    "propertyCard.featured": "Featured",

    // Home Page
    "home.featuredProperties": "Featured Properties",
    "home.handPicked": "Hand-picked properties from trusted owners",
    "home.viewAll": "View All",
    "home.viewAllProperties": "View All Properties",
    "home.whyChoose": "Why Choose HomiDirect?",
    "home.whyChooseDesc":
      "We connect renters directly with property owners, eliminating unnecessary costs and complications",
    "home.noAgentFees": "No Agent Fees",
    "home.noAgentFeesDesc":
      "Save thousands by dealing directly with property owners. No middleman, no extra costs.",
    "home.verifiedListings": "Verified Listings",
    "home.verifiedListingsDesc":
      "Every property and owner is verified to ensure a safe and trustworthy rental experience.",
    "home.directCommunication": "Direct Communication",
    "home.directCommunicationDesc":
      "Chat directly with property owners, schedule viewings, and negotiate terms on your terms.",
    "home.readyToFind": "Ready to Find Your Perfect Home?",
    "home.joinThousands":
      "Join thousands of renters who have found their dream homes without paying agent fees",
    "home.startSearching": "Start Searching",
    "home.listYourProperty": "List Your Property",
    "home.noListingsYet": "No properties available yet. Check back soon!",
    "home.allRightsReserved": " HomiDirect. All rights reserved.",
    "home.privacyPolicy": "Privacy Policy",
    "home.termsOfService": "Terms of Service",
    "home.contactUs": "Contact Us",

    // How It Works
    "howItWorks.title": "How HomiDirect Works",
    "howItWorks.subtitle":
      "Connect directly with property owners or find your ideal tenants. No agents, no commissions, no hassle.",
    "howItWorks.forTenants": "For Tenants",
    "howItWorks.forTenantsDesc":
      "Find your dream rental property and connect directly with owners in four simple steps",
    "howItWorks.forOwners": "For Property Owners",
    "howItWorks.forOwnersDesc":
      "List your property and find quality tenants without paying agent commissions",
    "howItWorks.step": "Step",
    "howItWorks.tenant.step1.title": "Search Properties",
    "howItWorks.tenant.step1.desc":
      "Browse through our extensive listing of properties. Use filters to find exactly what you're looking for - location, price, size, and amenities.",
    "howItWorks.tenant.step2.title": "Review Details",
    "howItWorks.tenant.step2.desc":
      "Check property details, photos, and owner information. No hidden fees, no agent commissions - just transparent information.",
    "howItWorks.tenant.step3.title": "Contact Owner Directly",
    "howItWorks.tenant.step3.desc":
      "Message the property owner directly through our platform. Ask questions, schedule viewings, and negotiate terms without intermediaries.",
    "howItWorks.tenant.step4.title": "Finalize Agreement",
    "howItWorks.tenant.step4.desc":
      "Once you've found your perfect home, finalize the rental agreement directly with the owner. Save on agent fees and move in faster.",
    "howItWorks.owner.step1.title": "List Your Property",
    "howItWorks.owner.step1.desc":
      "Create a detailed listing with photos, description, and amenities. It's free and takes just a few minutes to get started.",
    "howItWorks.owner.step2.title": "Verify Your Identity",
    "howItWorks.owner.step2.desc":
      "Complete our simple verification process to build trust with potential tenants. Your profile helps renters feel confident.",
    "howItWorks.owner.step3.title": "Manage Inquiries",
    "howItWorks.owner.step3.desc":
      "Receive and respond to inquiries directly. Schedule viewings at your convenience and communicate with potential tenants.",
    "howItWorks.owner.step4.title": "Select Your Tenant",
    "howItWorks.owner.step4.desc":
      "Review interested tenants, conduct your own screening, and select the best fit. Finalize the agreement on your terms.",
    "howItWorks.startSearchingProperties": "Start Searching Properties",
    "howItWorks.whyChoose": "Why Choose HomiDirect?",
    "howItWorks.commissionFees": "Commission Fees",
    "howItWorks.directCommunication": "Direct Communication",
    "howItWorks.quickConnections": "Quick Connections",
    "howItWorks.goToHomepage": "Go to Homepage",
    "howItWorks.footer":
      "© 2026 HomiDirect. Connecting property owners and tenants directly.",

    // Search Results
    "search.placeholder": "Search by location, property type...",
    "search.filters": "Filters",
    "search.search": "Search",
    "search.propertyType": "Property Type",
    "search.allTypes": "All Types",
    "search.apartment": "Apartment",
    "search.house": "House",
    "search.studio": "Studio",
    "search.penthouse": "Penthouse",
    "search.townhouse": "Townhouse",
    "search.loft": "Loft",
    "search.bedrooms": "Bedrooms",
    "search.bathrooms": "Bathrooms",
    "search.any": "Any",
    "search.priceRange": "Price Range",
    "search.minPrice": "Min Price",
    "search.maxPrice": "Max Price",
    "search.results": "Search Results",
    "search.foundProperties": "Found {count} properties in {location}",
    "search.sortBy": "Sort by",
    "search.featuredFirst": "Featured First",
    "search.priceLowToHigh": "Price: Low to High",
    "search.priceHighToLow": "Price: High to Low",
    "search.newestFirst": "Newest First",
    "search.previous": "Previous",
    "search.next": "Next",
    "search.room": "Room",
    "search.allLocations": "All Locations",
    "search.noResults": "No properties found matching your criteria.",
    "search.errorLoading": "Failed to load properties. Please try again.",

    // Common
    "common.tryAgain": "Try Again",
    "common.selectType": "Select type",
    "common.select": "Select",
    "common.footer": "© 2026 HomiDirect. Connect directly, rent confidently.",

    // Listing Detail
    "listingDetail.back": "Back",
    "listingDetail.backToSearch": "Back to Search",
    "listingDetail.notFound": "Listing Not Found",
    "listingDetail.notFoundDesc":
      "The listing you're looking for doesn't exist or has been removed.",
    "listingDetail.errorLoading": "Failed to load listing. Please try again.",
    "listingDetail.available": "Available",
    "listingDetail.unavailable": "Not Available",
    "listingDetail.bedrooms": "Bedrooms",
    "listingDetail.editListing": "Edit Listing",
    "listingDetail.deleteListing": "Delete Listing",
    "listingDetail.bathrooms": "Bathrooms",
    "listingDetail.area": "Area",
    "listingDetail.type": "Type",
    "listingDetail.description": "Description",
    "listingDetail.details": "Property Details",
    "listingDetail.propertyType": "Property Type",
    "listingDetail.maxTenants": "Max Tenants",
    "listingDetail.shareable": "Shareable",
    "listingDetail.yes": "Yes",
    "listingDetail.no": "No",
    "listingDetail.listedOn": "Listed On",
    "listingDetail.pricePerRoom": "Price Per Room",
    "listingDetail.month": "month",
    "listingDetail.monthlyRent": "Monthly Rent",
    "listingDetail.contactOwner": "Contact Owner",
    "listingDetail.requestViewing": "Request Viewing",
    "listingDetail.directContact":
      "Connect directly with the property owner - no agents, no fees.",
    "listingDetail.quickStats": "Quick Stats",
    "listingDetail.pricePerSqm": "Price per m²",
    "listingDetail.safetyTip": "Safety Tip",
    "listingDetail.safetyTipDesc":
      "Always visit the property before making any payments. Never send money without signing a proper rental agreement.",
    "listingDetail.shareText": "Check out this property",
    "listingDetail.linkCopied": "Link Copied",
    "listingDetail.linkCopiedDesc":
      "Property link has been copied to your clipboard",
    "listingDetail.shareFailed": "Failed to share",
    "listingDetail.manageBookings": "Manage Bookings",
    "listingDetail.manageBookingsDesc":
      "Accept, decline, and manage viewing requests",
    "listingDetail.bookingSent": "Booking request sent successfully",
    "listingDetail.today": "Today at",
    "listingDetail.tomorrow": "Tomorrow at",
    "listingDetail.availableViewingTimes": "Available Viewing Times",
    "listingDetail.book": "Book",
    "listingDetail.viewAllSlots": "View all {count} available slots",

    // Privacy Policy
    "privacy.title": "Privacy Policy",
    "privacy.lastUpdated": "Last updated: March 2026",
    "privacy.backToHome": "Back to Home",
    "privacy.section1.title": "1. Information We Collect",
    "privacy.section1.content":
      "We collect information you provide directly to us, including your name, email address, phone number, and property details when you create an account or list a property on HomiDirect.",
    "privacy.section2.title": "2. How We Use Your Information",
    "privacy.section2.content": "We use the information we collect to:",
    "privacy.section2.item1": "Provide, maintain, and improve our services",
    "privacy.section2.item2": "Process and complete transactions",
    "privacy.section2.item3": "Send you technical notices and support messages",
    "privacy.section2.item4":
      "Communicate with you about properties, services, and events",
    "privacy.section3.title": "3. Information Sharing",
    "privacy.section3.content":
      "We do not sell or rent your personal information to third parties. We may share your information only with your consent or as required by law.",
    "privacy.section4.title": "4. Data Security",
    "privacy.section4.content":
      "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
    "privacy.section5.title": "5. Your Rights",
    "privacy.section5.content":
      "You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us.",
    "privacy.section6.title": "6. Contact Us",
    "privacy.section6.content":
      "If you have any questions about this Privacy Policy, please contact us at privacy@homidirect.com",

    // Terms of Service
    "terms.title": "Terms of Service",
    "terms.lastUpdated": "Last updated: March 2026",
    "terms.backToHome": "Back to Home",
    "terms.section1.title": "1. Acceptance of Terms",
    "terms.section1.content":
      "By accessing and using HomiDirect, you accept and agree to be bound by the terms and provision of this agreement.",
    "terms.section2.title": "2. Use License",
    "terms.section2.content":
      "Permission is granted to temporarily use HomiDirect for personal, non-commercial transitory viewing only.",
    "terms.section3.title": "3. User Responsibilities",
    "terms.section3.content": "As a user of HomiDirect, you agree to:",
    "terms.section3.item1": "Provide accurate and truthful information",
    "terms.section3.item2": "Maintain the security of your account credentials",
    "terms.section3.item3": "Not engage in fraudulent or illegal activities",
    "terms.section3.item4":
      "Respect other users and follow community guidelines",
    "terms.section4.title": "4. Property Listings",
    "terms.section4.content":
      "Property owners are responsible for the accuracy of their listings and must provide valid verification documents. HomiDirect reserves the right to remove any listing that violates our terms.",
    "terms.section5.title": "5. Disclaimer",
    "terms.section5.content":
      "HomiDirect acts as a platform to connect property owners and renters. We do not guarantee the accuracy of listings or the conduct of users. All rental agreements are made directly between parties.",
    "terms.section6.title": "6. Limitation of Liability",
    "terms.section6.content":
      "HomiDirect shall not be liable for any damages arising from the use of our service, including but not limited to direct, indirect, incidental, or consequential damages.",
    "terms.section7.title": "7. Changes to Terms",
    "terms.section7.content":
      "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.",

    // Contact Page
    "contact.title": "Contact Us",
    "contact.subtitle":
      "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    "contact.backToHome": "Back to Home",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.address": "Address",
    "contact.formTitle": "Send us a message",
    "contact.name": "Name",
    "contact.namePlaceholder": "Your full name",
    "contact.emailLabel": "Email",
    "contact.emailPlaceholder": "your.email@example.com",
    "contact.subject": "Subject",
    "contact.subjectPlaceholder": "What is this regarding?",
    "contact.message": "Message",
    "contact.messagePlaceholder": "Tell us how we can help you...",
    "contact.sendMessage": "Send Message",
    "contact.messageSent": "Message Sent!",
    "contact.messageSentDesc":
      "We've received your message and will get back to you soon.",

    // My Profile
    "profile.title": "My Profile",
    "profile.subtitle": "Manage your account information",
    "profile.personalInfo": "Personal Information",
    "profile.personalInfoDesc": "Update your personal details",
    "profile.myBookings": "My Bookings",
    "profile.firstName": "First Name",
    "profile.lastName": "Last Name",
    "profile.email": "Email",
    "profile.role": "Account Type",
    "profile.memberSince": "Member Since",
    "profile.saveChanges": "Save Changes",
    "profile.saving": "Saving...",
    "profile.updateSuccess": "Profile updated successfully",
    "profile.updateError": "Failed to update profile. Please try again.",
    "profile.emailExists":
      "Email already in use. Please use a different email.",
    "profile.deleteAccount": "Delete Account",
    "profile.deleteAccountDesc":
      "Permanently delete your account and all associated data",
    "profile.deleteConfirmTitle": "Delete Account",
    "profile.deleteConfirmDesc":
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
    "profile.deleting": "Deleting...",
    "profile.deleteSuccess": "Account deleted successfully",
    "profile.deleteError": "Failed to delete account. Please try again.",
    "profile.dangerZone": "Danger Zone",
    "profile.cancel": "Cancel",
    "profile.tenant": "Tenant",
    "profile.landlord": "Property Owner",
    "profile.both": "Tenant & Property Owner",
    "profile.admin": "Administrator",
    "profile.editRole": "Change",
    "profile.roleDesc": "Select your account type(s)",
    "profile.tenantDesc": "Looking for rental properties",
    "profile.landlordDesc": "Want to list properties for rent",

    // My Listings
    "myListings.title": "My Listings",
    "myListings.subtitle": "Manage your property listings",
    "myListings.noListings": "You haven't listed any properties yet.",
    "myListings.createFirst": "Create Your First Listing",
    "myListings.errorLoading":
      "Failed to load your listings. Please try again.",
    "myListings.loginRequired": "Please log in to view your listings.",
    "myListings.landlordRequired":
      "Only property owners can view their listings.",
    "myListings.edit": "Edit",
    "myListings.delete": "Delete",
    "myListings.confirmDelete": "Are you sure you want to delete this listing?",
    "myListings.deleteSuccess": "Listing deleted successfully.",
    "myListings.deleteFailed": "Failed to delete listing. Please try again.",
    "myListings.available": "Available",
    "myListings.unavailable": "Unavailable",
    "myListings.pending": "Pending Verification",
    "myListings.verified": "Verified",
    "myListings.rejected": "Verification Rejected",

    // Edit Listing
    "editListing.title": "Edit Listing",
    "editListing.subtitle": "Update your property listing details below.",
    "editListing.backToListings": "Back to My Listings",
    "editListing.saveChanges": "Save Changes",
    "editListing.saving": "Saving...",
    "editListing.updated": "Listing Updated",
    "editListing.updatedDesc": "Your listing has been updated successfully.",
    "editListing.error": "Error",
    "editListing.errorDesc": "Failed to update listing. Please try again.",
    "editListing.notOwner": "Not Authorized",
    "editListing.notOwnerDesc": "You can only edit your own listings.",
    "editListing.availability": "Availability",
    "editListing.available": "Available",
    "editListing.unavailable": "Not Available",

    // Favorites
    "favorites.title": "My Favorites",
    "favorites.subtitle": "Properties you've saved",
    "favorites.noFavorites": "No saved properties yet",
    "favorites.saveSome": "Start exploring and save properties you like",
    "favorites.browseListings": "Browse Listings",
    "favorites.removed": "Removed from favorites",
    "favorites.added": "Added to favorites",
    "favorites.removeFailed": "Failed to remove from favorites",
    "favorites.removeTitle": "Remove from Favorites",
    "favorites.confirmRemove":
      "Are you sure you want to remove this property from your favorites?",
    "favorites.remove": "Remove",
    "favorites.errorLoading": "Failed to load favorites. Please try again.",
    "favorites.property": "property",
    "favorites.properties": "properties",

    // Common
    "common.cancel": "Cancel",

    // Location Search
    "locationSearch.searchAddress": "Search address...",
    "locationSearch.noLocationsFound": "No locations found.",
    "locationSearch.selectCity": "Select city...",
    "locationSearch.searchCities": "Search cities, neighborhoods...",
    "locationSearch.noCitiesFound": "No locations found.",
    "locationSearch.selectCountry": "Select country...",
    "locationSearch.searchCountries": "Search countries...",
    "locationSearch.noCountriesFound": "No countries found.",
    "locationSearch.typeToSearch": "Type to search...",
    "locationSearch.searching": "Searching...",
    "locationSearch.validation.invalidCity":
      "Please select a valid city from the list",
    "locationSearch.validation.invalidCountry":
      "Please select a valid country from the list",

    // Contact Owner Dialog
    "contactOwner.title": "Contact Property Owner",
    "contactOwner.subtitle": "Send a message about:",
    "contactOwner.name": "Your Name",
    "contactOwner.namePlaceholder": "Enter your full name",
    "contactOwner.email": "Email",
    "contactOwner.emailPlaceholder": "your.email@example.com",
    "contactOwner.phone": "Phone (optional)",
    "contactOwner.phonePlaceholder": "Your phone number",
    "contactOwner.message": "Message",
    "contactOwner.messagePlaceholder":
      "Hi, I'm interested in this property. I would like to know more about...",
    "contactOwner.send": "Send Message",
    "contactOwner.sending": "Sending...",
    "contactOwner.sent": "Message Sent!",
    "contactOwner.sentDesc":
      "The property owner will receive your message and contact you soon.",
    "contactOwner.error": "Error",
    "contactOwner.fillRequired": "Please fill in all required fields.",
    "contactOwner.sendFailed": "Failed to send message. Please try again.",
    "contactOwner.privacyNote":
      "Your contact information will only be shared with the property owner.",

    // Availability Slots
    "availabilitySlots.title": "Availability Slots",
    "availabilitySlots.addSlot": "Add Slot",
    "availabilitySlots.noSlots": "No availability slots added yet",
    "availabilitySlots.noSlotsDesc":
      "Add time slots when you're available for property viewings",
    "availabilitySlots.upcoming": "Upcoming Slots",
    "availabilitySlots.past": "Past Slots",
    "availabilitySlots.available": "Available",
    "availabilitySlots.booked": "Booked",
    "availabilitySlots.unbooked": "Unbooked",
    "availabilitySlots.today": "Today",
    "availabilitySlots.cancel": "Cancel",
    "availabilitySlots.addTitle": "Add Availability Slot",
    "availabilitySlots.date": "Date",
    "availabilitySlots.startTime": "Start Time",
    "availabilitySlots.endTime": "End Time",
    "availabilitySlots.fillAll": "Please fill in all fields",
    "availabilitySlots.endAfterStart": "End time must be after start time",
    "availabilitySlots.added": "Availability slot added",
    "availabilitySlots.addFailed": "Failed to add availability slot",
    "availabilitySlots.selectDate": "Select Date from Calendar",
    "availabilitySlots.existingSlots": "Existing Slots on",
    "availabilitySlots.previous": "Previous",
    "availabilitySlots.next": "Next",
    "availabilitySlots.noSlotsDate": "No slots available on this date",
    "availabilitySlots.selectDateFirst": "Please select a date first",
    "availabilitySlots.deleted": "Slot deleted",
    "availabilitySlots.deleteFailed": "Failed to delete slot",
    "availabilitySlots.loadingSlots": "Failed to load availability slots",

    // Bookings
    "bookings.title": "My Bookings",
    "bookings.noBookings": "No bookings yet",
    "bookings.noBookingsDesc":
      "When you book a viewing, it will appear here.",
    "bookings.browseListings": "Browse Listings",
    "bookings.errorLoading": "Failed to load bookings",
    "bookings.cancelConfirm":
      "Are you sure you want to cancel this booking?",
    "bookings.cancelled": "Booking cancelled",
    "bookings.cancelFailed": "Failed to cancel booking",
    "bookings.viewDetails": "View Details",
    "bookings.cancel": "Cancel",
    "bookings.pending": "Pending",
    "bookings.confirmed": "Confirmed",
    "bookings.declined": "Declined",
    "bookings.cancelledStatus": "Cancelled",
    "bookings.unknownListing": "Unknown Listing",
    "bookings.joinVideoCall": "Join Video Call",

    // Booking Detail
    "bookingDetail.title": "Booking Details",
    "bookingDetail.errorLoading": "Failed to load booking details",
    "bookingDetail.notFound": "Booking not found",
    "bookingDetail.backToBookings": "Back to Bookings",
    "bookingDetail.back": "Back",
    "bookingDetail.viewingSchedule": "Viewing Schedule",
    "bookingDetail.dateAndTime": "Date & Time",
    "bookingDetail.joinVideoCall": "Join Video Call",
    "bookingDetail.actions": "Actions",
    "bookingDetail.reviewRequest":
      "Review this viewing request and take action.",
    "bookingDetail.confirmBooking": "Confirm Booking",
    "bookingDetail.declineBooking": "Decline Booking",
    "bookingDetail.cancelBooking": "Cancel Booking",
    "bookingDetail.bookingConfirmed": "Booking confirmed",
    "bookingDetail.bookingDeclined": "Booking declined",
    "bookingDetail.updateFailed": "Failed to update booking",
    "bookingDetail.cancelConfirm":
      "Are you sure you want to cancel this booking?",
    "bookingDetail.bookingCancelled": "Booking cancelled",
    "bookingDetail.cancelFailed": "Failed to cancel booking",
    "bookingDetail.unknownListing": "Unknown Listing",
    "bookingDetail.noKeepIt": "No, keep it",
    "bookingDetail.yesCancel": "Yes, cancel booking",

    // Listing Bookings
    "listingBookings.manageBookings": "Manage Bookings",
    "listingBookings.backToListing": "Back to Listing",
    "listingBookings.listingNotFound": "Listing not found",
    "listingBookings.backToMyListings": "Back to My Listings",
    "listingBookings.bookingsTab": "Bookings",
    "listingBookings.timeSlotsTab": "Time Slots",
    "listingBookings.noBookings": "No bookings yet",
    "listingBookings.noBookingsDesc":
      "When candidates book viewings, they will appear here.",
    "listingBookings.candidateId": "Candidate ID",
    "listingBookings.accept": "Accept",
    "listingBookings.decline": "Decline",
    "listingBookings.availabilitySlots": "Availability Time Slots",
    "listingBookings.availabilitySlotsDesc":
      "Manage when candidates can book viewings for your property.",
    "listingBookings.addTimeSlot": "Add Time Slot",
    "listingBookings.noTimeSlots": "No time slots available",
    "listingBookings.noTimeSlotsDesc":
      "Add availability slots to let candidates book viewings.",
    "listingBookings.addFirstTimeSlot": "Add First Time Slot",
    "listingBookings.booked": "Booked",
    "listingBookings.available": "Available",
    "listingBookings.edit": "Edit",
    "listingBookings.delete": "Delete",
    "listingBookings.bookingConfirmed": "Booking confirmed",
    "listingBookings.bookingDeclined": "Booking declined",
    "listingBookings.updateFailed": "Failed to update booking",
    "listingBookings.cancelConfirm":
      "Are you sure you want to cancel this booking?",
    "listingBookings.bookingCancelled": "Booking cancelled",
    "listingBookings.cancelFailed": "Failed to cancel booking",
    "listingBookings.deleteSlotConfirm":
      "Are you sure you want to delete this time slot?",
    "listingBookings.slotDeleted": "Time slot deleted",
    "listingBookings.deleteSlotFailed": "Failed to delete time slot",
    "listingBookings.errorLoading": "Failed to load booking data",

    // Listing Verification
    "verification.title": "Property Verification",
    "verification.subtitle":
      "Verify your property ownership to build trust with potential tenants",
    "verification.back": "Back",
    "verification.authRequired": "Authentication Required",
    "verification.signIn": "sign in",
    "verification.authRequiredDesc":
      "Please {link} to access verification.",
    "verification.accessDenied": "Access Denied",
    "verification.accessDeniedDesc":
      "Only landlords can access the verification page.",
    "verification.listingNotFound": "Listing Not Found",
    "verification.listingNotFoundDesc":
      "The listing you're looking for doesn't exist or has been removed.",

    // Verification Upload
    "verification.docType.utilityBill": "Utility Bill",
    "verification.docType.titleDeed": "Title Deed",
    "verification.docType.leaseAgreement": "Lease Agreement",
    "verification.docType.propertyTax": "Property Tax Document",
    "verification.docType.other": "Other Document",
    "verification.docTypeDesc.utilityBill":
      "Recent utility bill (electricity, water, gas) showing property address",
    "verification.docTypeDesc.titleDeed":
      "Official property title deed or ownership certificate",
    "verification.docTypeDesc.leaseAgreement":
      "Signed lease agreement if you are renting out the property",
    "verification.docTypeDesc.propertyTax":
      "Property tax statement or receipt",
    "verification.docTypeDesc.other":
      "Any other relevant ownership documentation",
    "verification.status.pending": "Pending Review",
    "verification.status.pendingDesc":
      "Your documents are being reviewed by our team.",
    "verification.status.approved": "Approved",
    "verification.status.approvedDesc":
      "Your property has been verified successfully.",
    "verification.status.rejected": "Rejected",
    "verification.status.rejectedDesc":
      "Your verification was rejected. Please review the feedback and resubmit.",
    "verification.history": "Verification History",
    "verification.docUploaded": "Document uploaded successfully",
    "verification.uploadFailed": "Failed to upload document",
    "verification.docDeleted": "Document deleted successfully",
    "verification.deleteFailed": "Failed to delete document",
    "verification.errorTitle": "Error",
    "verification.errorLoadingStatus":
      "Failed to load verification status. Please try again.",
    "verification.retry": "Retry",
    "verification.statusTitle": "Verification Status",
    "verification.propertyLabel": "Property: {title}",
    "verification.resubmitAvailable": "Resubmission Available",
    "verification.resubmitDesc":
      "You can upload new documents to resubmit your verification request. Please review the rejection notes above and ensure your new documents meet the requirements.",
    "verification.uploadTitle": "Upload Verification Document",
    "verification.uploadDesc":
      "Upload a document to verify your property ownership or authorization",
    "verification.docRequirements": "Document Requirements",
    "verification.req1":
      "Document must clearly show the property address",
    "verification.req2":
      "Your name must match your account registration",
    "verification.req3":
      "Document should be dated within the last 3 months (for utility bills)",
    "verification.req4":
      "Accepted formats: PDF, JPEG, PNG, WebP (max 10MB)",
    "verification.docTypeLabel": "Document Type",
    "verification.dropHere": "Drop your file here",
    "verification.dragDrop": "Drag & drop your file here",
    "verification.orClickBrowse": "or click to browse",
    "verification.acceptedFormatsInfo":
      "PDF, JPEG, PNG, or WebP up to 10MB",
    "verification.uploading": "Uploading... {progress}%",
    "verification.uploadingButton": "Uploading...",
    "verification.uploadButton": "Upload Document",
    "verification.uploadedDocs": "Uploaded Documents",
    "verification.docCount": "{count} document(s) uploaded",
    "verification.view": "View",
    "verification.invalidFileType":
      "Invalid file type. Please upload a PDF, JPEG, PNG, or WebP file.",
    "verification.fileTooLarge":
      "File size exceeds {size}. Please upload a smaller file.",

    // Booking Dialog
    "bookingDialog.title": "Request Viewing",
    "bookingDialog.noSlotsAvailable":
      "No availability slots available for this property. Please check back later or contact the landlord directly.",
    "bookingDialog.selectDate": "Select Date",
    "bookingDialog.selectTimeSlot": "Select Time Slot",
    "bookingDialog.noSlotsOnDate": "No slots available on this date",
    "bookingDialog.selectDateFirst": "Please select a date first",
    "bookingDialog.requestViewing": "Request Viewing",
    "bookingDialog.failedLoadSlots":
      "Failed to load availability slots",
    "bookingDialog.selectSlot": "Please select a time slot",
    "bookingDialog.sent": "Booking request sent",
    "bookingDialog.failed": "Failed to create booking",

    // Not Found
    "notFound.title": "404",
    "notFound.subtitle": "Oops! Page not found",
    "notFound.returnHome": "Return to Home",

    // Currency
    "common.pricePerMonth": "€{price}/month",
    "common.perSqm": "€{price}/m²",
  },
  el: {
    // Navigation
    "nav.browse": "Αναζήτηση Ακινήτων",
    "nav.list": "Καταχωρήστε το Ακίνητό σας",
    "nav.howItWorks": "Πώς Λειτουργεί",
    "nav.signIn": "Σύνδεση",

    // Hero
    "hero.title": "Βρείτε την Ιδανική σας Ενοικίαση",
    "hero.subtitle":
      "Συνδεθείτε απευθείας με ιδιοκτήτες ακινήτων. Χωρίς μεσίτες, χωρίς προμήθειες.",
    "hero.location": "Τοποθεσία",
    "hero.propertyType": "Τύπος Ακινήτου",
    "hero.priceRange": "Εύρος Τιμής",
    "hero.search": "Αναζήτηση Ακινήτων",
    "hero.apartment": "Διαμέρισμα",
    "hero.house": "Μονοκατοικία",
    "hero.studio": "Στούντιο",

    // Auth
    "auth.login": "Σύνδεση",
    "auth.signup": "Εγγραφή",
    "auth.welcomeBack": "Καλώς Ήρθατε",
    "auth.loginDesc":
      "Εισάγετε τα στοιχεία σας για πρόσβαση στον λογαριασμό σας",
    "auth.email": "Email",
    "auth.password": "Κωδικός",
    "auth.loginButton": "Σύνδεση",
    "auth.loggingIn": "Γίνεται σύνδεση...",
    "auth.createAccount": "Δημιουργία Λογαριασμού",
    "auth.signupDesc": "Εγγραφείτε στο HomiDirect",
    "auth.fullName": "Ονοματεπώνυμο",
    "auth.confirmPassword": "Επιβεβαίωση Κωδικού",
    "auth.iAmA": "Είμαι:",
    "auth.tenant": "Ενοικιαστής",
    "auth.propertyOwner": "Ιδιοκτήτης Ακινήτου",
    "auth.signUpButton": "Εγγραφή",
    "auth.creatingAccount": "Δημιουργία λογαριασμού...",
    "auth.loginSuccess": "Επιτυχής σύνδεση",
    "auth.welcomeBackMsg": "Καλώς ήρθατε πίσω στο HomiDirect!",
    "auth.accountCreated": "Ο λογαριασμός δημιουργήθηκε",
    "auth.welcomeMsg": "Καλώς ήρθατε στο HomiDirect!",
    "auth.roleRequired": "Απαιτείται ρόλος",
    "auth.roleRequiredMsg":
      "Παρακαλώ επιλέξτε τουλάχιστον έναν ρόλο (Ενοικιαστής ή Ιδιοκτήτης Ακινήτου)",
    "auth.error": "Σφάλμα",
    "auth.loginFailed": "Η σύνδεση απέτυχε. Ελέγξτε τα στοιχεία σας.",
    "auth.signupFailed": "Η εγγραφή απέτυχε. Δοκιμάστε ξανά.",
    "auth.passwordMismatch": "Οι κωδικοί δεν ταιριάζουν",
    "auth.passwordTooShort":
      "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες",
    "auth.forgotPassword": "Ξεχάσατε τον Κωδικό",
    "auth.forgotPasswordDesc":
      "Εισάγετε τη διεύθυνση email σας και θα σας στείλουμε έναν σύνδεσμο για να επαναφέρετε τον κωδικό σας.",
    "auth.forgotPasswordLink": "Ξεχάσατε τον κωδικό σας;",
    "auth.sendResetLink": "Αποστολή Συνδέσμου Επαναφοράς",
    "auth.sending": "Αποστολή...",
    "auth.resetLinkSent": "Ο Σύνδεσμος Στάλθηκε",
    "auth.resetLinkSentDesc":
      "Αν υπάρχει λογαριασμός με αυτό το email, θα λάβετε έναν σύνδεσμο επαναφοράς κωδικού.",
    "auth.resetRequestFailed": "Αποτυχία αποστολής συνδέσμου. Δοκιμάστε ξανά.",
    "auth.checkYourEmail": "Ελέγξτε το Email σας",
    "auth.checkYourEmailDesc":
      "Σας στείλαμε έναν σύνδεσμο επαναφοράς κωδικού στο email σας. Ο σύνδεσμος λήγει σε 1 ώρα.",
    "auth.tryAnotherEmail": "Δοκιμάστε Άλλο Email",
    "auth.backToLogin": "Επιστροφή στη Σύνδεση",
    "auth.resetPassword": "Επαναφορά Κωδικού",
    "auth.resetPasswordDesc": "Εισάγετε τον νέο σας κωδικό παρακάτω.",
    "auth.newPassword": "Νέος Κωδικός",
    "auth.confirmNewPassword": "Επιβεβαίωση Νέου Κωδικού",
    "auth.resetPasswordButton": "Επαναφορά Κωδικού",
    "auth.resetting": "Επαναφορά...",
    "auth.passwordResetSuccess": "Επιτυχής Επαναφορά Κωδικού",
    "auth.passwordResetSuccessDesc":
      "Ο κωδικός σας επαναφέρθηκε. Μπορείτε τώρα να συνδεθείτε με τον νέο σας κωδικό.",
    "auth.goToLogin": "Μετάβαση στη Σύνδεση",
    "auth.resetFailed":
      "Αποτυχία επαναφοράς κωδικού. Ο σύνδεσμος μπορεί να έχει λήξει.",
    "auth.invalidResetLink": "Μη Έγκυρος Σύνδεσμος",
    "auth.invalidResetLinkDesc":
      "Αυτός ο σύνδεσμος επαναφοράς κωδικού είναι μη έγκυρος ή έχει λήξει. Ζητήστε έναν νέο.",
    "auth.requestNewLink": "Αίτηση Νέου Συνδέσμου",
    "auth.enterToken": "Εισάγετε τον Κωδικό Επαναφοράς",
    "auth.enterTokenDesc": "Εισάγετε τον κωδικό που στείλαμε στο email σας.",
    "auth.tokenSentTo": "Στείλαμε έναν κωδικό επαναφοράς στο",
    "auth.resetToken": "Κωδικός Επαναφοράς",
    "auth.tokenPlaceholder": "Επικολλήστε τον κωδικό εδώ",
    "auth.verifyToken": "Συνέχεια",
    "auth.resendToken": "Επαναποστολή Κωδικού",
    "auth.tokenRequired": "Παρακαλώ εισάγετε τον κωδικό από το email σας",
    "auth.back": "Πίσω",
    "auth.googleSignIn": "Σύνδεση με Google",
    "auth.googleSignUp": "Εγγραφή με Google",
    "auth.googleAccountExists": "Υπάρχει ήδη λογαριασμός με αυτό το email. Παρακαλώ συνδεθείτε με το email και τον κωδικό σας.",
    "auth.googleAuthFailed": "Η αυθεντικοποίηση Google απέτυχε. Παρακαλώ δοκιμάστε ξανά.",
    "auth.orContinueWith": "ή συνεχίστε με",

    // User Menu
    "userMenu.myListings": "Οι Καταχωρήσεις μου",
    "userMenu.favorites": "Αγαπημένα",
    "userMenu.profile": "Προφίλ",
    "userMenu.settings": "Ρυθμίσεις",
    "userMenu.logout": "Αποσύνδεση",

    // List Property Info
    "listInfo.title": "Καταχωρήστε το Ακίνητό σας",
    "listInfo.subtitle":
      "Συνδεθείτε με ενοικιαστές απευθείας και εξοικονομήστε προμήθειες μεσιτών.",
    "listInfo.noFees": "Χωρίς Προμήθειες Μεσίτη",
    "listInfo.noFeesDesc": "Κρατήστε το 100% του εισοδήματος από ενοίκια",
    "listInfo.setPrice": "Ορίστε τη τιμή σας",
    "listInfo.setPriceDesc":
      "Εσείς ελέγχετε την τιμολόγηση και τους όρους του ακινήτου σας",
    "listInfo.directContact": "Άμεση Επικοινωνία",
    "listInfo.directContactDesc":
      "Επικοινωνήστε απευθείας με πιθανούς ενοικιαστές",
    "listInfo.howToList": "Πώς να Καταχωρήσετε το ακίνητό σας",
    "listInfo.howToListDesc":
      "Ακολουθήστε τα βήματα για να καταχωρήσετε το ακίνητό σας:",
    "listInfo.step1": "Εγγραφείτε ως Ιδιοκτήτης Ακινήτου",
    "listInfo.step1Desc":
      'Δημιουργήστε λογαριασμό και επιλέξτε "Ιδιοκτήτης Ακινήτου" κατά την εγγραφή',
    "listInfo.step2": "Συμπληρώστε τα Στοιχεία του Ακινήτου",
    "listInfo.step2Desc":
      "Παρέχετε ακριβείς πληροφορίες για το ακίνητό σας συμπεριλαμβανομένης της τοποθεσίας, τιμής και ανέσεων",
    "listInfo.step3": "Ανεβάστε Φωτογραφίες & Επαλήθευση",
    "listInfo.step3Desc":
      "Προσθέστε φωτογραφίες υψηλής ποιότητας και ανεβάστε ένα έγγραφο επαλήθευσης (λογαριασμός κοινής ωφέλειας ή τίτλος ιδιοκτησίας)",
    "listInfo.step4": "Συνδεθείτε με Ενοικιαστές",
    "listInfo.step4Desc":
      "Μόλις εγκριθεί, το ακίνητό σας θα είναι online και οι ενοικιαστές θα μπορούν να επικοινωνήσουν μαζί σας απευθείας",
    "listInfo.needRegister":
      "Πρέπει να είστε εγγεγραμμένος ως Ιδιοκτήτης Ακινήτου για να καταχωρήσετε ακίνητα.",
    "listInfo.tenantAccount":
      "Ο λογαριασμός σας είναι εγγεγραμμένος ως Ενοικιαστής. Παρακαλώ δημιουργήστε νέο λογαριασμό ως Ιδιοκτήτης Ακινήτου για να καταχωρήσετε ακίνητα.",
    "listInfo.registerButton": "Εγγραφή ως Ιδιοκτήτης Ακινήτου",
    "listInfo.startListing": "Έναρξη Καταχώρησης",

    // List Property Form
    "listForm.title": "Καταχωρήστε το Ακίνητό σας",
    "listForm.subtitle":
      "Συμπληρώστε τα παρακάτω στοιχεία για να καταχωρήσετε το ακίνητό σας και να συνδεθείτε με ενοικιαστές απευθείας.",
    "listForm.propertyDetails": "Στοιχεία Ακινήτου",
    "listForm.propertyDetailsDesc":
      "Παρέχετε ακριβείς πληροφορίες για να προσελκύσετε ποιοτικούς ενοικιαστές",
    "listForm.propertyTitle": "Τίτλος Ακινήτου",
    "listForm.titlePlaceholder": "π.χ., Μοντέρνο 2ΥΔ Διαμέρισμα στο Κέντρο",
    "listForm.propertyType": "Τύπος Ακινήτου",
    "listForm.monthlyRent": "Μηνιαίο Ενοίκιο (EUR)",
    "listForm.city": "Πόλη",
    "listForm.cityPlaceholder": "π.χ., Αθήνα",
    "listForm.address": "Διεύθυνση",
    "listForm.postalCode": "Ταχυδρομικός Κώδικας",
    "listForm.country": "Χώρα",
    "listForm.bedrooms": "Υπνοδωμάτια",
    "listForm.bathrooms": "Μπάνια",
    "listForm.area": "Εμβαδόν (τ.μ.)",
    "listForm.description": "Περιγραφή",
    "listForm.descriptionPlaceholder":
      "Περιγράψτε το ακίνητό σας, ανέσεις, κοντινές εγκαταστάσεις...",
    "listForm.propertyImages": "Φωτογραφίες Ακινήτου",
    "listForm.imagesHint":
      "Ανεβάστε φωτογραφίες υψηλής ποιότητας. Η πρώτη φωτογραφία θα είναι η κύρια.",
    "listForm.submitButton": "Καταχώρηση Ακινήτου",
    "listForm.submitting": "Δημιουργία καταχώρησης...",
    "listForm.listed": "Το Ακίνητο Καταχωρήθηκε!",
    "listForm.listedDesc": "Το ακίνητό σας υποβλήθηκε προς έλεγχο.",
    "listForm.error": "Σφάλμα",
    "listForm.errorDesc": "Αποτυχία δημιουργίας καταχώρησης. Δοκιμάστε ξανά.",
    "listForm.accessDenied": "Δεν Επιτρέπεται η Πρόσβαση",
    "listForm.accessDeniedDesc":
      "Πρέπει να είστε εγγεγραμμένος ως Ιδιοκτήτης Ακινήτου για να καταχωρήσετε ακίνητα.",
    "listForm.verificationNote":
      "Μετά τη δημιουργία της καταχώρησης, θα μεταφερθείτε για να ανεβάσετε έγγραφα επαλήθευσης.",
    "listForm.types.apartment": "Διαμέρισμα",
    "listForm.types.house": "Μονοκατοικία",
    "listForm.types.studio": "Στούντιο",
    "listForm.types.room": "Δωμάτιο",
    "listForm.validation.error": "Σφάλμα Επικύρωσης",
    "listForm.validation.fixErrors":
      "Παρακαλώ διορθώστε τα σφάλματα στη φόρμα.",
    "listForm.validation.titleRequired": "Ο τίτλος ακινήτου είναι υποχρεωτικός",
    "listForm.validation.typeRequired": "Ο τύπος ακινήτου είναι υποχρεωτικός",
    "listForm.validation.priceRequired":
      "Η τιμή πρέπει να είναι μεγαλύτερη από 0",
    "listForm.validation.cityRequired": "Η πόλη είναι υποχρεωτική",
    "listForm.validation.addressRequired": "Η διεύθυνση είναι υποχρεωτική",
    "listForm.validation.bedroomsRequired":
      "Ο αριθμός υπνοδωματίων είναι υποχρεωτικός",
    "listForm.validation.bathroomsRequired":
      "Ο αριθμός μπάνιων είναι υποχρεωτικός",
    "listForm.validation.areaRequired":
      "Το εμβαδόν πρέπει να είναι μεγαλύτερο από 0",
    "listForm.validation.imagesRequired": "Απαιτούνται Φωτογραφίες",
    "listForm.validation.addImages":
      "Παρακαλώ ανεβάστε τουλάχιστον μία φωτογραφία του ακινήτου σας.",

    // Image Upload Component
    "imageUpload.dragOrClick":
      "Σύρετε και αποθέστε εικόνες εδώ, ή κάντε κλικ για επιλογή",
    "imageUpload.supportedFormats": "Υποστηρίζονται JPEG, PNG, WebP",
    "imageUpload.maxReached": "Μέγιστος αριθμός εικόνων",
    "imageUpload.imagesUploaded": "εικόνες ανεβασμένες",
    "imageUpload.uploading": "Ανέβασμα...",
    "imageUpload.files": "αρχεία",
    "imageUpload.primary": "Κύρια",
    "imageUpload.noImages": "Δεν έχουν ανεβεί εικόνες ακόμα",
    "imageUpload.uploadError": "Σφάλμα Ανεβάσματος",
    "imageUpload.uploadFailed": "Αποτυχία ανεβάσματος εικόνας. Δοκιμάστε ξανά.",
    "imageUpload.invalidType":
      "Μη έγκυρος τύπος αρχείου. Επιτρέπονται μόνο JPEG, PNG και WebP.",
    "imageUpload.fileTooLarge":
      "Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος 5MB.",
    "imageUpload.tooManyImages": "Πολλές Εικόνες",
    "imageUpload.maxImagesReached": "Επιτρέπονται μέχρι {max} εικόνες.",
    "imageUpload.imageRemoved": "Η Εικόνα Αφαιρέθηκε",
    "imageUpload.imageRemovedDesc": "Η εικόνα αφαιρέθηκε.",
    "imageUpload.removeError": "Σφάλμα Αφαίρεσης",
    "imageUpload.removeFailed": "Αποτυχία αφαίρεσης εικόνας. Δοκιμάστε ξανά.",

    // Hero
    "hero.perfectHome": "Ανακαλύψτε το σπίτι που σας ταιριάζει",
    "hero.withoutHassle": "Χωρίς Ταλαιπωρία",
    "hero.connectDirectly":
      "Συνδεθείτε απευθείας με ιδιοκτήτες ακινήτων. Χωρίς μεσίτες, χωρίς επιπλέον χρεώσεις.",
    "hero.searchPlaceholder": "Πόλη, περιοχή...",
    "hero.apartments": "Διαμερίσματα",
    "hero.houses": "Μονοκατοικίες",
    "hero.studios": "Στούντιο",
    "hero.room": "Δωμάτια",
    "hero.activeListings": "Ενεργές Καταχωρήσεις",
    "hero.propertyOwners": "Ιδιοκτήτες Ακινήτων",
    "hero.agentFees": "Προμήθειες Μεσίτη",

    // Property Card
    "propertyCard.perMonth": "το μήνα",
    "propertyCard.beds": "Κρεβάτια",
    "propertyCard.baths": "Μπάνια",
    "propertyCard.featured": "Προτεινόμενο",

    // Home Page
    "home.featuredProperties": "Προτεινόμενα Ακίνητα",
    "home.handPicked": "Επιλεγμένα ακίνητα από αξιόπιστους ιδιοκτήτες",
    "home.viewAll": "Προβολή Όλων",
    "home.viewAllProperties": "Προβολή Όλων των Ακινήτων",
    "home.whyChoose": "Γιατί να επιλέξετε το HomiDirect;",
    "home.whyChooseDesc":
      "Το HomiDirect σας φέρνει σε άμεση επαφή με ιδιοκτήτες, χωρίς μεσάζοντες και περιττά έξοδα.",
    "home.noAgentFees": "Χωρίς Προμήθειες Μεσίτη",
    "home.noAgentFeesDesc":
      "Εξοικονομήστε χρήματα συναλλασσόμενοι απευθείας με ιδιοκτήτες. Χωρίς μεσάζοντες, χωρίς κρυφά κόστη.",
    "home.verifiedListings": "Επαληθευμένες Καταχωρήσεις",
    "home.verifiedListingsDesc":
      "Κάθε ακίνητο και ιδιοκτήτης ελέγχεται, ώστε να απολαμβάνετε μια ασφαλή και αξιόπιστη εμπειρία ενοικίασης.",
    "home.directCommunication": "Άμεση Επικοινωνία",
    "home.directCommunicationDesc":
      "Επικοινωνήστε απευθείας με ιδιοκτήτες, προγραμματίστε συναντήσεις και συμφωνήστε τους όρους χωρίς μεσάζοντες.",
    "home.readyToFind":
      "Το επόμενο σπίτι σας είναι πιο κοντά απ’ όσο νομίζετε.",
    "home.joinThousands":
      "Χιλιάδες ενοικιαστές βρήκαν σπίτι χωρίς μεσάζοντες και προμήθειες, ενώ ιδιοκτήτες μίσθωσαν τα ακίνητά τους γρήγορα και απλά.",
    "home.startSearching": "Αναζήτηση ακινήτων",
    "home.listYourProperty": "Καταχωρήστε το ακίνητό σας",
    "home.noListingsYet":
      "Δεν υπάρχουν ακόμα διαθέσιμα ακίνητα. Ελέγξτε ξανά σύντομα!",
    "home.allRightsReserved":
      " HomiDirect. Όλα τα δικαιώματα διατηρούνται.",
    "home.privacyPolicy": "Πολιτική Απορρήτου",
    "home.termsOfService": "Όροι Χρήσης",
    "home.contactUs": "Επικοινωνήστε Μαζί μας",

    // How It Works
    "howItWorks.title": "Πώς Λειτουργεί το HomiDirect",
    "howItWorks.subtitle":
      "Συνδεθείτε απευθείας με ιδιοκτήτες ακινήτων ή βρείτε τους ιδανικούς ενοικιαστές. Χωρίς μεσίτες, χωρίς προμήθειες, χωρίς ταλαιπωρία.",
    "howItWorks.forTenants": "Για Ενοικιαστές",
    "howItWorks.forTenantsDesc":
      "Βρείτε το ακίνητο ενοικίασης των ονείρων σας και συνδεθείτε απευθείας με ιδιοκτήτες σε τέσσερα απλά βήματα",
    "howItWorks.forOwners": "Για Ιδιοκτήτες Ακινήτων",
    "howItWorks.forOwnersDesc":
      "Καταχωρήστε το ακίνητό σας και βρείτε ποιοτικούς ενοικιαστές χωρίς να πληρώσετε προμήθειες μεσίτη",
    "howItWorks.step": "Βήμα",
    "howItWorks.tenant.step1.title": "Αναζήτηση Ακινήτων",
    "howItWorks.tenant.step1.desc":
      "Περιηγηθείτε στην εκτενή λίστα ακινήτων μας. Χρησιμοποιήστε φίλτρα για να βρείτε ακριβώς αυτό που ψάχνετε - τοποθεσία, τιμή, μέγεθος και ανέσεις.",
    "howItWorks.tenant.step2.title": "Έλεγχος Λεπτομερειών",
    "howItWorks.tenant.step2.desc":
      "Ελέγξτε τις λεπτομέρειες του ακινήτου, φωτογραφίες και πληροφορίες ιδιοκτήτη. Χωρίς κρυφές χρεώσεις, χωρίς προμήθειες μεσίτη - μόνο διαφανείς πληροφορίες.",
    "howItWorks.tenant.step3.title": "Επικοινωνία Απευθείας με τον Ιδιοκτήτη",
    "howItWorks.tenant.step3.desc":
      "Στείλτε μήνυμα στον ιδιοκτήτη του ακινήτου απευθείας μέσω της πλατφόρμας μας. Κάντε ερωτήσεις, προγραμματίστε προβολές και διαπραγματευτείτε όρους χωρίς μεσάζοντες.",
    "howItWorks.tenant.step4.title": "Οριστικοποίηση Συμφωνίας",
    "howItWorks.tenant.step4.desc":
      "Μόλις βρείτε το ιδανικό σας σπίτι, οριστικοποιήστε τη συμφωνία ενοικίασης απευθείας με τον ιδιοκτήτη. Εξοικονομήστε σε προμήθειες μεσίτη και μετακομίστε πιο γρήγορα.",
    "howItWorks.owner.step1.title": "Καταχωρήστε το Ακίνητό σας",
    "howItWorks.owner.step1.desc":
      "Δημιουργήστε μια λεπτομερή καταχώρηση με φωτογραφίες, περιγραφή και ανέσεις. Είναι δωρεάν και χρειάζονται μόνο λίγα λεπτά για να ξεκινήσετε.",
    "howItWorks.owner.step2.title": "Επαληθεύστε την Ταυτότητά σας",
    "howItWorks.owner.step2.desc":
      "Ολοκληρώστε τη διαδικασία επαλήθευσης για να χτίσετε εμπιστοσύνη με πιθανούς ενοικιαστές. Το προφίλ σας βοηθά τους ενοικιαστές να νιώθουν σίγουροι.",
    "howItWorks.owner.step3.title": "Διαχείριση Ερωτημάτων",
    "howItWorks.owner.step3.desc":
      "Λαμβάνετε και απαντάτε σε ερωτήματα απευθείας. Προγραμματίστε προβολές στη διευκόλυνσή σας και επικοινωνήστε με πιθανούς ενοικιαστές.",
    "howItWorks.owner.step4.title": "Επιλέξτε τον Ενοικιαστή σας",
    "howItWorks.owner.step4.desc":
      "Εξετάστε ενδιαφερόμενους ενοικιαστές, διεξάγετε τον δικό σας έλεγχο και επιλέξτε τον καλύτερο. Οριστικοποιήστε τη συμφωνία με τους δικούς σας όρους.",
    "howItWorks.startSearchingProperties": "Έναρξη Αναζήτησης Ακινήτων",
    "howItWorks.whyChoose": "Γιατί να Επιλέξετε το HomiDirect;",
    "howItWorks.commissionFees": "Προμήθειες",
    "howItWorks.directCommunication": "Άμεση Επικοινωνία",
    "howItWorks.quickConnections": "Γρήγορες Συνδέσεις",
    "howItWorks.goToHomepage": "Μετάβαση στην Αρχική",
    "howItWorks.footer":
      "© 2026 HomiDirect. Συνδέοντας ιδιοκτήτες ακινήτων και ενοικιαστές απευθείας.",

    // Search Results
    "search.placeholder": "Αναζήτηση...",
    "search.filters": "Φίλτρα",
    "search.search": "Αναζήτηση",
    "search.propertyType": "Τύπος Ακινήτου",
    "search.allTypes": "Όλοι οι Τύποι",
    "search.apartment": "Διαμέρισμα",
    "search.house": "Μονοκατοικία",
    "search.studio": "Στούντιο",
    "search.penthouse": "Ρετιρέ",
    "search.townhouse": "Αρχοντικό",
    "search.loft": "Λοφτ",
    "search.bedrooms": "Υπνοδωμάτια",
    "search.bathrooms": "Μπάνια",
    "search.any": "Οποιοδήποτε",
    "search.priceRange": "Εύρος Τιμής",
    "search.minPrice": "Ελάχιστη Τιμή",
    "search.maxPrice": "Μέγιστη Τιμή",
    "search.results": "Αποτελέσματα αναζήτησης",
    "search.foundProperties": "Βρέθηκαν {count} ακίνητα στο {location}",
    "search.sortBy": "Ταξινόμηση κατά",
    "search.featuredFirst": "Προτεινόμενα Πρώτα",
    "search.priceLowToHigh": "Τιμή (Χαμηλή σε Υψηλή)",
    "search.priceHighToLow": "Τιμή (Υψηλή σε Χαμηλή)",
    "search.newestFirst": "Νεότερα Πρώτα",
    "search.previous": "Προηγούμενο",
    "search.next": "Επόμενο",
    "search.room": "Δωμάτιο",
    "search.allLocations": "Όλες οι Τοποθεσίες",
    "search.noResults":
      "Δεν βρέθηκαν ακίνητα που ταιριάζουν με τα κριτήριά σας.",
    "search.errorLoading": "Αποτυχία φόρτωσης ακινήτων. Δοκιμάστε ξανά.",

    // Common
    "common.tryAgain": "Δοκιμάστε Ξανά",
    "common.selectType": "Επιλογή τύπου",
    "common.select": "Επιλογή",
    "common.footer":
      "© 2026 HomiDirect. Συνδεθείτε απευθείας, ενοικιάστε με εμπιστοσύνη.",

    // Listing Detail
    "listingDetail.back": "Πίσω",
    "listingDetail.backToSearch": "Επιστροφή στην Αναζήτηση",
    "listingDetail.notFound": "Η Καταχώρηση δεν Βρέθηκε",
    "listingDetail.notFoundDesc":
      "Η καταχώρηση που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.",
    "listingDetail.errorLoading":
      "Αποτυχία φόρτωσης καταχώρησης. Δοκιμάστε ξανά.",
    "listingDetail.available": "Διαθέσιμο",
    "listingDetail.unavailable": "Μη Διαθέσιμο",
    "listingDetail.bedrooms": "Υπνοδωμάτια",
    "listingDetail.bathrooms": "Μπάνια",
    "listingDetail.area": "Εμβαδόν",
    "listingDetail.type": "Τύπος",
    "listingDetail.description": "Περιγραφή",
    "listingDetail.details": "Λεπτομέρειες Ακινήτου",
    "listingDetail.propertyType": "Τύπος Ακινήτου",
    "listingDetail.maxTenants": "Μέγιστος Αριθμός Ενοικιαστών",
    "listingDetail.shareable": "Κοινόχρηστο",
    "listingDetail.yes": "Ναι",
    "listingDetail.no": "Όχι",
    "listingDetail.listedOn": "Ημερομηνία Καταχώρησης",
    "listingDetail.pricePerRoom": "Τιμή ανά Δωμάτιο",
    "listingDetail.month": "μήνα",
    "listingDetail.monthlyRent": "Μηνιαίο Ενοίκιο",
    "listingDetail.contactOwner": "Επικοινωνία με Ιδιοκτήτη",
    "listingDetail.requestViewing": "Αίτημα Επίσκεψης",
    "listingDetail.directContact":
      "Συνδεθείτε απευθείας με τον ιδιοκτήτη - χωρίς μεσίτες, χωρίς χρεώσεις.",
    "listingDetail.quickStats": "Γρήγορα Στατιστικά",
    "listingDetail.pricePerSqm": "Τιμή ανά τ.μ.",
    "listingDetail.safetyTip": "Συμβουλή Ασφαλείας",
    "listingDetail.safetyTipDesc":
      "Πάντα επισκεφθείτε το ακίνητο πριν κάνετε οποιαδήποτε πληρωμή. Ποτέ μην στέλνετε χρήματα χωρίς να υπογράψετε κατάλληλη σύμβαση ενοικίασης.",
    "listingDetail.shareText": "Δείτε αυτό το ακίνητο",
    "listingDetail.linkCopied": "Ο σύνδεσμος αντιγράφηκε",
    "listingDetail.linkCopiedDesc":
      "Ο σύνδεσμος του ακινήτου αντιγράφηκε στο πρόχειρο",
    "listingDetail.shareFailed": "Αποτυχία κοινοποίησης",
    "listingDetail.editListing": "Επεξεργασία Καταχώρησης",
    "listingDetail.deleteListing": "Διαγραφή Καταχώρησης",
    "listingDetail.manageBookings": "Διαχείριση Κρατήσεων",
    "listingDetail.manageBookingsDesc":
      "Αποδοχή, απόρριψη και διαχείριση αιτημάτων επίσκεψης",
    "listingDetail.bookingSent": "Το αίτημα κράτησης στάλθηκε επιτυχώς",
    "listingDetail.today": "Σήμερα στις",
    "listingDetail.tomorrow": "Αύριο στις",
    "listingDetail.availableViewingTimes": "Διαθέσιμες Ώρες Επίσκεψης",
    "listingDetail.book": "Κράτηση",
    "listingDetail.viewAllSlots":
      "Προβολή όλων των {count} διαθέσιμων διαστημάτων",

    // Privacy Policy
    "privacy.title": "Πολιτική Απορρήτου",
    "privacy.lastUpdated": "Τελευταία ενημέρωση: Μάρτιος 2026",
    "privacy.backToHome": "Επιστροφή στην Αρχική",
    "privacy.section1.title": "1. Πληροφορίες που Συλλέγουμε",
    "privacy.section1.content":
      "Συλλέγουμε πληροφορίες που μας παρέχετε απευθείας, συμπεριλαμβανομένου του ονόματος, email, τηλεφώνου και στοιχείων ακινήτου όταν δημιουργείτε λογαριασμό ή καταχωρείτε ακίνητο στο HomiDirect.",
    "privacy.section2.title": "2. Πώς Χρησιμοποιούμε τις Πληροφορίες σας",
    "privacy.section2.content":
      "Χρησιμοποιούμε τις πληροφορίες που συλλέγουμε για να:",
    "privacy.section2.item1":
      "Παρέχουμε, συντηρούμε και βελτιώνουμε τις υπηρεσίες μας",
    "privacy.section2.item2": "Επεξεργαζόμαστε και ολοκληρώνουμε συναλλαγές",
    "privacy.section2.item3":
      "Σας στέλνουμε τεχνικές ειδοποιήσεις και μηνύματα υποστήριξης",
    "privacy.section2.item4":
      "Επικοινωνούμε μαζί σας για ακίνητα, υπηρεσίες και εκδηλώσεις",
    "privacy.section3.title": "3. Κοινοποίηση Πληροφοριών",
    "privacy.section3.content":
      "Δεν πουλάμε ούτε ενοικιάζουμε τα προσωπικά σας δεδομένα σε τρίτους. Μπορούμε να κοινοποιήσουμε τις πληροφορίες σας μόνο με τη συγκατάθεσή σας ή όπως απαιτείται από το νόμο.",
    "privacy.section4.title": "4. Ασφάλεια Δεδομένων",
    "privacy.section4.content":
      "Εφαρμόζουμε κατάλληλα μέτρα ασφαλείας για την προστασία των προσωπικών σας δεδομένων από μη εξουσιοδοτημένη πρόσβαση, τροποποίηση, αποκάλυψη ή καταστροφή.",
    "privacy.section5.title": "5. Τα Δικαιώματά σας",
    "privacy.section5.content":
      "Έχετε το δικαίωμα να έχετε πρόσβαση, να ενημερώσετε ή να διαγράψετε τα προσωπικά σας δεδομένα ανά πάσα στιγμή. Μπορείτε να το κάνετε μέσω των ρυθμίσεων του λογαριασμού σας ή επικοινωνώντας μαζί μας.",
    "privacy.section6.title": "6. Επικοινωνήστε μαζί μας",
    "privacy.section6.content":
      "Εάν έχετε ερωτήσεις σχετικά με αυτήν την Πολιτική Απορρήτου, επικοινωνήστε μαζί μας στο privacy@homidirect.com",

    // Terms of Service
    "terms.title": "Όροι Χρήσης",
    "terms.lastUpdated": "Τελευταία ενημέρωση: Μάρτιος 2026",
    "terms.backToHome": "Επιστροφή στην Αρχική",
    "terms.section1.title": "1. Αποδοχή Όρων",
    "terms.section1.content":
      "Με την πρόσβαση και χρήση του HomiDirect, αποδέχεστε και συμφωνείτε να δεσμεύεστε από τους όρους και τις διατάξεις αυτής της συμφωνίας.",
    "terms.section2.title": "2. Άδεια Χρήσης",
    "terms.section2.content":
      "Χορηγείται άδεια για προσωρινή χρήση του HomiDirect για προσωπική, μη εμπορική χρήση μόνο.",
    "terms.section3.title": "3. Ευθύνες Χρήστη",
    "terms.section3.content": "Ως χρήστης του HomiDirect, συμφωνείτε να:",
    "terms.section3.item1": "Παρέχετε ακριβείς και αληθείς πληροφορίες",
    "terms.section3.item2":
      "Διατηρείτε την ασφάλεια των στοιχείων του λογαριασμού σας",
    "terms.section3.item3":
      "Δεν συμμετέχετε σε δόλιες ή παράνομες δραστηριότητες",
    "terms.section3.item4":
      "Σέβεστε άλλους χρήστες και ακολουθείτε τις οδηγίες της κοινότητας",
    "terms.section4.title": "4. Καταχωρήσεις Ακινήτων",
    "terms.section4.content":
      "Οι ιδιοκτήτες ακινήτων είναι υπεύθυνοι για την ακρίβεια των καταχωρήσεών τους και πρέπει να παρέχουν έγκυρα έγγραφα επαλήθευσης. Το HomiDirect διατηρεί το δικαίωμα να αφαιρέσει οποιαδήποτε καταχώρηση που παραβιάζει τους όρους μας.",
    "terms.section5.title": "5. Αποποίηση Ευθύνης",
    "terms.section5.content":
      "Το HomiDirect δρα ως πλατφόρμα για τη σύνδεση ιδιοκτητών ακινήτων και ενοικιαστών. Δεν εγγυόμαστε την ακρίβεια των καταχωρήσεων ή τη συμπεριφορά των χρηστών. Όλες οι συμφωνίες ενοικίασης γίνονται απευθείας μεταξύ των μερών.",
    "terms.section6.title": "6. Περιορισμός Ευθύνης",
    "terms.section6.content":
      "Το HomiDirect δεν ευθύνεται για τυχόν ζημίες που προκύπτουν από τη χρήση της υπηρεσίας μας, συμπεριλαμβανομένων, ενδεικτικά, άμεσων, έμμεσων, τυχαίων ή επακόλουθων ζημιών.",
    "terms.section7.title": "7. Αλλαγές στους Όρους",
    "terms.section7.content":
      "Διατηρούμε το δικαίωμα να τροποποιήσουμε αυτούς τους όρους ανά πάσα στιγμή. Η συνεχής χρήση της υπηρεσίας μετά από αλλαγές συνιστά αποδοχή των νέων όρων.",

    // Contact Page
    "contact.title": "Επικοινωνήστε μαζί μας",
    "contact.subtitle":
      "Έχετε ερωτήσεις; Θα χαρούμε να ακούσουμε από εσάς. Στείλτε μας ένα μήνυμα και θα απαντήσουμε το συντομότερο δυνατόν.",
    "contact.backToHome": "Επιστροφή στην Αρχική",
    "contact.email": "Email",
    "contact.phone": "Τηλέφωνο",
    "contact.address": "Διεύθυνση",
    "contact.formTitle": "Στείλτε μας ένα μήνυμα",
    "contact.name": "Όνομα",
    "contact.namePlaceholder": "Το πλήρες όνομά σας",
    "contact.emailLabel": "Email",
    "contact.emailPlaceholder": "to.email.sas@example.com",
    "contact.subject": "Θέμα",
    "contact.subjectPlaceholder": "Σχετικά με τι είναι;",
    "contact.message": "Μήνυμα",
    "contact.messagePlaceholder": "Πείτε μας πώς μπορούμε να σας βοηθήσουμε...",
    "contact.sendMessage": "Αποστολή Μηνύματος",
    "contact.messageSent": "Το Μήνυμα Στάλθηκε!",
    "contact.messageSentDesc":
      "Λάβαμε το μήνυμά σας και θα επικοινωνήσουμε μαζί σας σύντομα.",

    // My Profile
    "profile.title": "Το Προφίλ μου",
    "profile.subtitle": "Διαχειριστείτε τα στοιχεία του λογαριασμού σας",
    "profile.personalInfo": "Προσωπικά Στοιχεία",
    "profile.personalInfoDesc": "Ενημερώστε τα προσωπικά σας στοιχεία",
    "profile.myBookings": "Οι κρατήσεις μου",
    "profile.firstName": "Όνομα",
    "profile.lastName": "Επώνυμο",
    "profile.email": "Email",
    "profile.role": "Τύπος Λογαριασμού",
    "profile.memberSince": "Μέλος από",
    "profile.saveChanges": "Αποθήκευση Αλλαγών",
    "profile.saving": "Αποθήκευση...",
    "profile.updateSuccess": "Το προφίλ ενημερώθηκε επιτυχώς",
    "profile.updateError": "Αποτυχία ενημέρωσης προφίλ. Δοκιμάστε ξανά.",
    "profile.emailExists":
      "Το email χρησιμοποιείται ήδη. Παρακαλώ χρησιμοποιήστε άλλο email.",
    "profile.deleteAccount": "Διαγραφή Λογαριασμού",
    "profile.deleteAccountDesc":
      "Διαγράψτε μόνιμα τον λογαριασμό σας και όλα τα σχετικά δεδομένα",
    "profile.deleteConfirmTitle": "Διαγραφή Λογαριασμού",
    "profile.deleteConfirmDesc":
      "Είστε σίγουροι ότι θέλετε να διαγράψετε τον λογαριασμό σας; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί και όλα τα δεδομένα σας θα διαγραφούν μόνιμα.",
    "profile.deleting": "Διαγραφή...",
    "profile.deleteSuccess": "Ο λογαριασμός διαγράφηκε επιτυχώς",
    "profile.deleteError": "Αποτυχία διαγραφής λογαριασμού. Δοκιμάστε ξανά.",
    "profile.dangerZone": "Επικίνδυνη Ζώνη",
    "profile.cancel": "Ακύρωση",
    "profile.tenant": "Ενοικιαστής",
    "profile.landlord": "Ιδιοκτήτης Ακινήτου",
    "profile.both": "Ενοικιαστής & Ιδιοκτήτης",
    "profile.admin": "Διαχειριστής",
    "profile.editRole": "Αλλαγή",
    "profile.roleDesc": "Επιλέξτε τον τύπο λογαριασμού σας",
    "profile.tenantDesc": "Αναζητώ ακίνητα προς ενοικίαση",
    "profile.landlordDesc": "Θέλω να καταχωρήσω ακίνητα προς ενοικίαση",

    // My Listings
    "myListings.title": "Οι Καταχωρήσεις μου",
    "myListings.subtitle": "Διαχειριστείτε τις καταχωρήσεις ακινήτων σας",
    "myListings.noListings": "Δεν έχετε καταχωρήσει ακόμα ακίνητα.",
    "myListings.createFirst": "Δημιουργήστε την Πρώτη σας Καταχώρηση",
    "myListings.errorLoading":
      "Αποτυχία φόρτωσης καταχωρήσεων. Δοκιμάστε ξανά.",
    "myListings.loginRequired": "Συνδεθείτε για να δείτε τις καταχωρήσεις σας.",
    "myListings.landlordRequired":
      "Μόνο ιδιοκτήτες ακινήτων μπορούν να δουν τις καταχωρήσεις τους.",
    "myListings.edit": "Επεξεργασία",
    "myListings.delete": "Διαγραφή",
    "myListings.confirmDelete":
      "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτήν την καταχώρηση;",
    "myListings.deleteSuccess": "Η καταχώρηση διαγράφηκε επιτυχώς.",
    "myListings.deleteFailed": "Αποτυχία διαγραφής. Δοκιμάστε ξανά.",
    "myListings.available": "Διαθέσιμο",
    "myListings.unavailable": "Μη Διαθέσιμο",
    "myListings.pending": "Αναμονή Επαλήθευσης",
    "myListings.verified": "Επαληθευμένο",
    "myListings.rejected": "Απορρίφθηκε",

    // Edit Listing
    "editListing.title": "Επεξεργασία Καταχώρησης",
    "editListing.subtitle":
      "Ενημερώστε τα στοιχεία της καταχώρησής σας παρακάτω.",
    "editListing.backToListings": "Επιστροφή στις Καταχωρήσεις μου",
    "editListing.saveChanges": "Αποθήκευση Αλλαγών",
    "editListing.saving": "Αποθήκευση...",
    "editListing.updated": "Η Καταχώρηση Ενημερώθηκε",
    "editListing.updatedDesc": "Η καταχώρησή σας ενημερώθηκε επιτυχώς.",
    "editListing.error": "Σφάλμα",
    "editListing.errorDesc": "Αποτυχία ενημέρωσης καταχώρησης. Δοκιμάστε ξανά.",
    "editListing.notOwner": "Μη Εξουσιοδοτημένο",
    "editListing.notOwnerDesc":
      "Μπορείτε να επεξεργαστείτε μόνο τις δικές σας καταχωρήσεις.",
    "editListing.availability": "Διαθεσιμότητα",
    "editListing.available": "Διαθέσιμο",
    "editListing.unavailable": "Μη Διαθέσιμο",

    // Favorites
    "favorites.title": "Τα Αγαπημένα μου",
    "favorites.subtitle": "Ακίνητα που έχετε αποθηκεύσει",
    "favorites.noFavorites": "Δεν έχετε αποθηκευμένα ακίνητα ακόμα",
    "favorites.saveSome":
      "Ξεκινήστε την εξερεύνηση και αποθηκεύστε ακίνητα που σας αρέσουν",
    "favorites.browseListings": "Περιήγηση Καταχωρήσεων",
    "favorites.removed": "Αφαιρέθηκε από τα αγαπημένα",
    "favorites.added": "Προστέθηκε στα αγαπημένα",
    "favorites.removeFailed": "Αποτυχία αφαίρεσης από τα αγαπημένα",
    "favorites.removeTitle": "Αφαίρεση από τα Αγαπημένα",
    "favorites.confirmRemove":
      "Είστε σίγουροι ότι θέλετε να αφαιρέσετε αυτό το ακίνητο από τα αγαπημένα σας;",
    "favorites.remove": "Αφαίρεση",
    "favorites.errorLoading": "Αποτυχία φόρτωσης αγαπημένων. Δοκιμάστε ξανά.",
    "favorites.property": "ακίνητο",
    "favorites.properties": "ακίνητα",

    // Common
    "common.cancel": "Ακύρωση",

    // Location Search
    "locationSearch.searchAddress": "Αναζήτηση διεύθυνσης...",
    "locationSearch.noLocationsFound": "Δεν βρέθηκαν τοποθεσίες.",
    "locationSearch.selectCity": "Επιλέξτε πόλη...",
    "locationSearch.searchCities": "Αναζήτηση πόλεων, γειτονιών...",
    "locationSearch.noCitiesFound": "Δεν βρέθηκαν τοποθεσίες.",
    "locationSearch.selectCountry": "Επιλέξτε χώρα...",
    "locationSearch.searchCountries": "Αναζήτηση χωρών...",
    "locationSearch.noCountriesFound": "Δεν βρέθηκαν χώρες.",
    "locationSearch.typeToSearch": "Πληκτρολογήστε για αναζήτηση...",
    "locationSearch.searching": "Αναζήτηση...",
    "locationSearch.validation.invalidCity":
      "Παρακαλώ επιλέξτε έγκυρη πόλη από τη λίστα",
    "locationSearch.validation.invalidCountry":
      "Παρακαλώ επιλέξτε έγκυρη χώρα από τη λίστα",

    // Contact Owner Dialog
    "contactOwner.title": "Επικοινωνία με Ιδιοκτήτη",
    "contactOwner.subtitle": "Στείλτε μήνυμα σχετικά με:",
    "contactOwner.name": "Το Όνομά σας",
    "contactOwner.namePlaceholder": "Εισάγετε το πλήρες όνομά σας",
    "contactOwner.email": "Email",
    "contactOwner.emailPlaceholder": "to.email.sas@example.com",
    "contactOwner.phone": "Τηλέφωνο (προαιρετικό)",
    "contactOwner.phonePlaceholder": "Ο αριθμός τηλεφώνου σας",
    "contactOwner.message": "Μήνυμα",
    "contactOwner.messagePlaceholder":
      "Γεια σας, ενδιαφέρομαι για αυτό το ακίνητο. Θα ήθελα να μάθω περισσότερα για...",
    "contactOwner.send": "Αποστολή Μηνύματος",
    "contactOwner.sending": "Αποστολή...",
    "contactOwner.sent": "Το Μήνυμα Στάλθηκε!",
    "contactOwner.sentDesc":
      "Ο ιδιοκτήτης θα λάβει το μήνυμά σας και θα επικοινωνήσει μαζί σας σύντομα.",
    "contactOwner.error": "Σφάλμα",
    "contactOwner.fillRequired":
      "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.",
    "contactOwner.sendFailed": "Αποτυχία αποστολής μηνύματος. Δοκιμάστε ξανά.",
    "contactOwner.privacyNote":
      "Τα στοιχεία επικοινωνίας σας θα κοινοποιηθούν μόνο στον ιδιοκτήτη του ακινήτου.",

    // Availability Slots
    "availabilitySlots.title": "Διαθεσιμότητα Επισκέψεων",
    "availabilitySlots.addSlot": "Προσθήκη Χρονικού Διαστήματος",
    "availabilitySlots.noSlots":
      "Δεν έχουν προστεθεί διαστήματα διαθεσιμότητας ακόμα",
    "availabilitySlots.noSlotsDesc":
      "Προσθέστε χρονικά διαστήματα όταν είστε διαθέσιμος για επισκέψεις ακινήτων",
    "availabilitySlots.upcoming": "Επόμενα Διαστήματα",
    "availabilitySlots.past": "Περασμένα Διαστήματα",
    "availabilitySlots.available": "Διαθέσιμο",
    "availabilitySlots.booked": "Κρατημένο",
    "availabilitySlots.unbooked": "Μη Κρατημένο",
    "availabilitySlots.today": "Σήμερα",
    "availabilitySlots.cancel": "Ακύρωση",
    "availabilitySlots.addTitle": "Προσθήκη Διαστήματος Διαθεσιμότητας",
    "availabilitySlots.date": "Ημερομηνία",
    "availabilitySlots.startTime": "Ώρα Έναρξης",
    "availabilitySlots.endTime": "Ώρα Λήξης",
    "availabilitySlots.fillAll": "Παρακαλώ συμπληρώστε όλα τα πεδία",
    "availabilitySlots.endAfterStart":
      "Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης",
    "availabilitySlots.added": "Το διάστημα διαθεσιμότητας προστέθηκε",
    "availabilitySlots.addFailed":
      "Αποτυχία προσθήκης διαστήματος διαθεσιμότητας",
    "availabilitySlots.selectDate": "Επιλέξτε Ημερομηνία από το Ημερολόγιο",
    "availabilitySlots.existingSlots": "Υπάρχοντα Διαστήματα στις",
    "availabilitySlots.previous": "Προηγούμενο",
    "availabilitySlots.next": "Επόμενο",
    "availabilitySlots.noSlotsDate":
      "Δεν υπάρχουν διαθέσιμα διαστήματα σε αυτή την ημερομηνία",
    "availabilitySlots.selectDateFirst": "Παρακαλώ επιλέξτε ημερομηνία πρώτα",
    "availabilitySlots.deleted": "Το διάστημα διαγράφηκε",
    "availabilitySlots.deleteFailed": "Αποτυχία διαγραφής διαστήματος",
    "availabilitySlots.loadingSlots":
      "Αποτυχία φόρτωσης διαστημάτων διαθεσιμότητας",

    // Bookings
    "bookings.title": "Οι Κρατήσεις μου",
    "bookings.noBookings": "Δεν υπάρχουν κρατήσεις ακόμα",
    "bookings.noBookingsDesc":
      "Όταν κλείσετε μια επίσκεψη, θα εμφανίζεται εδώ.",
    "bookings.browseListings": "Περιήγηση Καταχωρήσεων",
    "bookings.errorLoading": "Αποτυχία φόρτωσης κρατήσεων",
    "bookings.cancelConfirm":
      "Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή τη κράτηση;",
    "bookings.cancelled": "Η κράτηση ακυρώθηκε",
    "bookings.cancelFailed": "Αποτυχία ακύρωσης κράτησης",
    "bookings.viewDetails": "Προβολή Λεπτομερειών",
    "bookings.cancel": "Ακύρωση",
    "bookings.pending": "Εκκρεμεί",
    "bookings.confirmed": "Επιβεβαιωμένη",
    "bookings.declined": "Απορριφθείσα",
    "bookings.cancelledStatus": "Ακυρωμένη",
    "bookings.unknownListing": "Άγνωστη Καταχώρηση",
    "bookings.joinVideoCall": "Συμμετοχή σε Βιντεοκλήση",

    // Booking Detail
    "bookingDetail.title": "Στοιχεία Κράτησης",
    "bookingDetail.errorLoading":
      "Αποτυχία φόρτωσης στοιχείων κράτησης",
    "bookingDetail.notFound": "Η κράτηση δεν βρέθηκε",
    "bookingDetail.backToBookings": "Πίσω στις Κρατήσεις",
    "bookingDetail.back": "Πίσω",
    "bookingDetail.viewingSchedule": "Πρόγραμμα Επίσκεψης",
    "bookingDetail.dateAndTime": "Ημερομηνία & Ώρα",
    "bookingDetail.joinVideoCall": "Συμμετοχή σε Βιντεοκλήση",
    "bookingDetail.actions": "Ενέργειες",
    "bookingDetail.reviewRequest":
      "Εξετάστε αυτό το αίτημα επίσκεψης και αναλάβετε δράση.",
    "bookingDetail.confirmBooking": "Επιβεβαίωση Κράτησης",
    "bookingDetail.declineBooking": "Απόρριψη Κράτησης",
    "bookingDetail.cancelBooking": "Ακύρωση Κράτησης",
    "bookingDetail.bookingConfirmed": "Η κράτηση επιβεβαιώθηκε",
    "bookingDetail.bookingDeclined": "Η κράτηση απορρίφθηκε",
    "bookingDetail.updateFailed": "Αποτυχία ενημέρωσης κράτησης",
    "bookingDetail.cancelConfirm":
      "Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή τη κράτηση;",
    "bookingDetail.bookingCancelled": "Η κράτηση ακυρώθηκε",
    "bookingDetail.cancelFailed": "Αποτυχία ακύρωσης κράτησης",
    "bookingDetail.unknownListing": "Άγνωστη Καταχώρηση",
    "bookingDetail.noKeepIt": "Όχι, κρατήστε το",
    "bookingDetail.yesCancel": "Ναι, ακύρωση κράτησης",

    // Listing Bookings
    "listingBookings.manageBookings": "Διαχείριση Κρατήσεων",
    "listingBookings.backToListing": "Πίσω στην Καταχώρηση",
    "listingBookings.listingNotFound": "Η καταχώρηση δεν βρέθηκε",
    "listingBookings.backToMyListings":
      "Πίσω στις Καταχωρήσεις μου",
    "listingBookings.bookingsTab": "Κρατήσεις",
    "listingBookings.timeSlotsTab": "Χρονικά Διαστήματα",
    "listingBookings.noBookings": "Δεν υπάρχουν κρατήσεις ακόμα",
    "listingBookings.noBookingsDesc":
      "Όταν οι υποψήφιοι κλείνουν επισκέψεις, θα εμφανίζονται εδώ.",
    "listingBookings.candidateId": "Αριθμός Υποψηφίου",
    "listingBookings.accept": "Αποδοχή",
    "listingBookings.decline": "Απόρριψη",
    "listingBookings.availabilitySlots":
      "Διαθέσιμα Χρονικά Διαστήματα",
    "listingBookings.availabilitySlotsDesc":
      "Διαχειριστείτε πότε οι υποψήφιοι μπορούν να κλείσουν επισκέψεις",
    "listingBookings.addTimeSlot": "Προσθήκη Διαστήματος",
    "listingBookings.noTimeSlots":
      "Δεν υπάρχουν διαθέσιμα χρονικά διαστήματα",
    "listingBookings.noTimeSlotsDesc":
      "Προσθέστε διαθέσιμα διαστήματα για να επιτρέψετε στους υποψηφίους να κλείσουν επισκέψεις.",
    "listingBookings.addFirstTimeSlot": "Προσθήκη Πρώτου Διαστήματος",
    "listingBookings.booked": "Κρατημένο",
    "listingBookings.available": "Διαθέσιμο",
    "listingBookings.edit": "Επεξεργασία",
    "listingBookings.delete": "Διαγραφή",
    "listingBookings.bookingConfirmed": "Η κράτηση επιβεβαιώθηκε",
    "listingBookings.bookingDeclined": "Η κράτηση απορρίφθηκε",
    "listingBookings.updateFailed":
      "Αποτυχία ενημέρωσης κράτησης",
    "listingBookings.cancelConfirm":
      "Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή τη κράτηση;",
    "listingBookings.bookingCancelled": "Η κράτηση ακυρώθηκε",
    "listingBookings.cancelFailed": "Αποτυχία ακύρωσης κράτησης",
    "listingBookings.deleteSlotConfirm":
      "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το χρονικό διάστημα;",
    "listingBookings.slotDeleted": "Το χρονικό διάστημα διαγράφηκε",
    "listingBookings.deleteSlotFailed":
      "Αποτυχία διαγραφής διαστήματος",
    "listingBookings.errorLoading":
      "Αποτυχία φόρτωσης δεδομένων κράτησης",

    // Listing Verification
    "verification.title": "Επαλήθευση Ακινήτου",
    "verification.subtitle":
      "Επαληθεύστε την ιδιοκτησία του ακινήτου σας για να χτίσετε εμπιστοσύνη με πιθανούς ενοικιαστές",
    "verification.back": "Πίσω",
    "verification.authRequired": "Απαιτείται Ταυτοποίηση",
    "verification.signIn": "συνδεθείτε",
    "verification.authRequiredDesc":
      "Παρακαλώ {link} για πρόσβαση στην επαλήθευση.",
    "verification.accessDenied": "Δεν Επιτρέπεται η Πρόσβαση",
    "verification.accessDeniedDesc":
      "Μόνο ιδιοκτήτες ακινήτων μπορούν να αποκτήσουν πρόσβαση στη σελίδα επαλήθευσης.",
    "verification.listingNotFound": "Η Καταχώρηση δεν Βρέθηκε",
    "verification.listingNotFoundDesc":
      "Η καταχώρηση που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.",

    // Verification Upload
    "verification.docType.utilityBill":
      "Λογαριασμός Κοινής Ωφέλειας",
    "verification.docType.titleDeed": "Τίτλος Ιδιοκτησίας",
    "verification.docType.leaseAgreement": "Σύμβαση Ενοικίασης",
    "verification.docType.propertyTax": "Ενδειξη Φόρου Ακινήτου",
    "verification.docType.other": "Άλλο Έγγραφο",
    "verification.docTypeDesc.utilityBill":
      "Πρόσφατος λογαριασμός κοινής ωφέλειας (ηλεκτρικού, νερού, αερίου) με τη διεύθυνση του ακινήτου",
    "verification.docTypeDesc.titleDeed":
      "Επίσημος τίτλος ιδιοκτησίας ή πιστοποιητικό κυριότητας",
    "verification.docTypeDesc.leaseAgreement":
      "Υπογεγραμμένη σύμβαση ενοικίασης αν ενοικιάζετε το ακίνητο",
    "verification.docTypeDesc.propertyTax":
      "Εκκαθαριστικό ή απόδειξη πληρωμής φόρου ακινήτου",
    "verification.docTypeDesc.other":
      "Οποιοδήποτε άλλο σχετικό έγγραφο ιδιοκτησίας",
    "verification.status.pending": "Εκκρεμεί Έλεγχος",
    "verification.status.pendingDesc":
      "Τα έγγραφά σας ελέγχονται από την ομάδα μας.",
    "verification.status.approved": "Εγκεκριμένο",
    "verification.status.approvedDesc":
      "Το ακίνητό σας έχει επαληθευτεί επιτυχώς.",
    "verification.status.rejected": "Απορριφθέν",
    "verification.status.rejectedDesc":
      "Η επαλήθευση σας απορρίφθηκε. Ελέγξτε τα σχόλια και υποβάλετε ξανά.",
    "verification.history": "Ιστορικό Επαλήθευσης",
    "verification.docUploaded":
      "Το έγγραφο ανέβηκε επιτυχώς",
    "verification.uploadFailed":
      "Αποτυχία ανεβάσματος εγγράφου",
    "verification.docDeleted":
      "Το έγγραφο διαγράφηκε επιτυχώς",
    "verification.deleteFailed":
      "Αποτυχία διαγραφής εγγράφου",
    "verification.errorTitle": "Σφάλμα",
    "verification.errorLoadingStatus":
      "Αποτυχία φόρτωσης κατάστασης επαλήθευσης. Δοκιμάστε ξανά.",
    "verification.retry": "Επανάληψη",
    "verification.statusTitle": "Κατάσταση Επαλήθευσης",
    "verification.propertyLabel": "Ακίνητο: {title}",
    "verification.resubmitAvailable": "Δυνατότητα Επαναυποβολής",
    "verification.resubmitDesc":
      "Μπορείτε να ανεβάσετε νέα έγγραφα για να επαναυποβάλετε το αίτημα επαλήθευσης. Ελέγξτε τα σχόλια απόρριψης και βεβαιωθείτε ότι τα νέα σας έγγραφα πληρούν τις απαιτήσεις.",
    "verification.uploadTitle":
      "Ανέβασμα Εγγράφου Επαλήθευσης",
    "verification.uploadDesc":
      "Ανεβάστε ένα έγγραφο για να επαληθεύσετε την ιδιοκτησία ή την εξουσιοδότησή σας",
    "verification.docRequirements":
      "Απαιτήσεις Εγγράφων",
    "verification.req1":
      "Το έγγραφο πρέπει να δείχνει ξεκάθαρα τη διεύθυνση του ακινήτου",
    "verification.req2":
      "Το όνομά σας πρέπει να ταιριάζει με την εγγραφή του λογαριασμού σας",
    "verification.req3":
      "Το έγγραφο πρέπει να είναι χρονολογημένο μέσα στους τελευταίους 3 μήνες (για λογαριασμούς κοινής ωφέλειας)",
    "verification.req4":
      "Αποδεκτές μορφές: PDF, JPEG, PNG, WebP (μέχρι 10MB)",
    "verification.docTypeLabel": "Τύπος Εγγράφου",
    "verification.dropHere": "Αφήστε το αρχείο εδώ",
    "verification.dragDrop":
      "Σύρετε & αφήστε το αρχείο σας εδώ",
    "verification.orClickBrowse": "ή κάντε κλικ για αναζήτηση",
    "verification.acceptedFormatsInfo":
      "PDF, JPEG, PNG ή WebP μέχρι 10MB",
    "verification.uploading": "Ανέβασμα... {progress}%",
    "verification.uploadingButton": "Ανέβασμα...",
    "verification.uploadButton": "Ανέβασμα Εγγράφου",
    "verification.uploadedDocs": "Ανεβασμένα Έγγραφα",
    "verification.docCount":
      "{count} έγγραφο(α) ανεβασμένα",
    "verification.view": "Προβολή",
    "verification.invalidFileType":
      "Μη έγκυρος τύπος αρχείου. Ανεβάστε PDF, JPEG, PNG ή WebP.",
    "verification.fileTooLarge":
      "Το μέγεθος του αρχείου ξεπερνά τα {size}. Ανεβάστε ένα μικρότερο αρχείο.",

    // Booking Dialog
    "bookingDialog.title": "Αίτημα Επίσκεψης",
    "bookingDialog.noSlotsAvailable":
      "Δεν υπάρχουν διαθέσιμα χρονικά διαστήματα για αυτό το ακίνητο. Ελέγξτε ξανά αργότερα ή επικοινωνήστε απευθείας με τον ιδιοκτήτη.",
    "bookingDialog.selectDate": "Επιλογή Ημερομηνίας",
    "bookingDialog.selectTimeSlot":
      "Επιλογή Χρονικού Διαστήματος",
    "bookingDialog.noSlotsOnDate":
      "Δεν υπάρχουν διαθέσιμα διαστήματα σε αυτή την ημερομηνία",
    "bookingDialog.selectDateFirst":
      "Παρακαλώ επιλέξτε ημερομηνία πρώτα",
    "bookingDialog.requestViewing": "Αίτημα Επίσκεψης",
    "bookingDialog.failedLoadSlots":
      "Αποτυχία φόρτωσης διαθέσιμων διαστημάτων",
    "bookingDialog.selectSlot":
      "Παρακαλώ επιλέξτε χρονικό διάστημα",
    "bookingDialog.sent": "Το αίτημα κράτησης στάλθηκε",
    "bookingDialog.failed": "Αποτυχία δημιουργίας κράτησης",

    // Not Found
    "notFound.title": "404",
    "notFound.subtitle": "Ωχ! Η σελίδα δεν βρέθηκε",
    "notFound.returnHome": "Επιστροφή στην Αρχική",

    // Currency
    "common.pricePerMonth": "{price}€/μήνα",
    "common.perSqm": "{price}€/τ.μ.",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return saved === "en" || saved === "el" ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  const locale = language === "el" ? "el-GR" : "en-US";

  return (
    <LanguageContext.Provider value={{ language, locale, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
