// Define the subscription limits based on plan
export const SUBSCRIPTION_LIMITS = {
    free: {
        maxFamilies: 1,
        maxFamilyMembers: 50,
        features: {
            dataExport: false,
            advancedRelationshipMapping: false,
            familyStories: false,
            prioritySupport: false,
            collaborativeEditing: false,
            advancedMediaStorage: false
        }
    },
    premium: {
        maxFamilies: 5,
        maxFamilyMembers: 500,
        features: {
            dataExport: true,
            advancedRelationshipMapping: true,
            familyStories: true,
            prioritySupport: true,
            collaborativeEditing: false,
            advancedMediaStorage: false
        }
    },
    family: {
        maxFamilies: Infinity,
        maxFamilyMembers: Infinity,
        features: {
            dataExport: true,
            advancedRelationshipMapping: true,
            familyStories: true,
            prioritySupport: true,
            collaborativeEditing: true,
            advancedMediaStorage: true
        }
    }
};

// Check if user can create another family
export function canCreateFamily(
    subscriptionTier: 'free' | 'premium' | 'family',
    currentFamilyCount: number
): boolean {
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier].maxFamilies;
    return currentFamilyCount < limit;
}

// Check if user can add more members to a family
export function canAddFamilyMember(
    subscriptionTier: 'free' | 'premium' | 'family',
    currentMemberCount: number
): boolean {
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier].maxFamilyMembers;

    // Debug line for troubleshooting
    console.log(`Checking member limit: tier=${subscriptionTier}, currentCount=${currentMemberCount}, limit=${limit}, canAdd=${currentMemberCount < limit}`);

    return currentMemberCount < limit;
}

// Check if user has access to a specific feature
export function hasFeatureAccess(
    subscriptionTier: 'free' | 'premium' | 'family',
    feature: keyof typeof SUBSCRIPTION_LIMITS.free.features
): boolean {
    return SUBSCRIPTION_LIMITS[subscriptionTier].features[feature];
}

// Get the limit message for a specific action
export function getLimitMessage(
    subscriptionTier: 'free' | 'premium' | 'family',
    limitType: 'family' | 'member' | string
): string {
    const tier = subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1);

    switch (limitType) {
        case 'family':
            const familyLimit = SUBSCRIPTION_LIMITS[subscriptionTier].maxFamilies;
            return `Your ${tier} plan allows a maximum of ${familyLimit === Infinity ? 'unlimited' : familyLimit} family trees. Upgrade your subscription to create more.`;

        case 'member':
            const memberLimit = SUBSCRIPTION_LIMITS[subscriptionTier].maxFamilyMembers;
            return `Your ${tier} plan allows a maximum of ${memberLimit === Infinity ? 'unlimited' : memberLimit} family members per tree. Upgrade your subscription to add more.`;

        case 'stories':
            return `Family stories are only available with Premium and Family plans. Upgrade your subscription to unlock this feature.`;

        case 'export':
            return `Data export is only available with Premium and Family plans. Upgrade your subscription to unlock this feature.`;

        case 'collaboration':
            return `Collaborative editing is only available with the Family plan. Upgrade your subscription to unlock this feature.`;

        default:
            return `This feature is not available on your current plan. Upgrade to unlock more features.`;
    }
}

// Get the actual limit value for a specific category
export function getUserLimit(
    subscriptionTier: 'free' | 'premium' | 'family',
    limitType: 'maxFamilies' | 'maxFamilyMembers'
): number {
    // Default to the free tier if the subscription tier is invalid
    if (!subscriptionTier ||
        (subscriptionTier !== 'free' &&
            subscriptionTier !== 'premium' &&
            subscriptionTier !== 'family')) {
        subscriptionTier = 'free';
    }

    return SUBSCRIPTION_LIMITS[subscriptionTier][limitType];
}

// Log subscription tiers and limits for debugging
export function logSubscriptionLimits(): void {
    console.log('SUBSCRIPTION LIMITS:');
    console.log('Free tier: ' +
        SUBSCRIPTION_LIMITS.free.maxFamilies + ' families, ' +
        SUBSCRIPTION_LIMITS.free.maxFamilyMembers + ' members/family');
    console.log('Premium tier: ' +
        SUBSCRIPTION_LIMITS.premium.maxFamilies + ' families, ' +
        SUBSCRIPTION_LIMITS.premium.maxFamilyMembers + ' members/family');
    console.log('Family tier: ' +
        (SUBSCRIPTION_LIMITS.family.maxFamilies === Infinity ? 'unlimited' : SUBSCRIPTION_LIMITS.family.maxFamilies) + ' families, ' +
        (SUBSCRIPTION_LIMITS.family.maxFamilyMembers === Infinity ? 'unlimited' : SUBSCRIPTION_LIMITS.family.maxFamilyMembers) + ' members/family');
} 