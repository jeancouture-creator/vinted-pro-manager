// Plan limits configuration and checker
export const PLAN_LIMITS = {
    free: {
        items: 50,
        orders: 20,
        ai_credits: 10,
        features: {
            ai_price_suggestions: false,
            ai_descriptions: false,
            ai_discounts: false,
            social_posts: false,
            advanced_analytics: false,
            pdf_reports: false,
            multi_account: false,
            api_access: false,
            white_label: false,
            advanced_returns: false,
            google_sheets: false
        }
    },
    pro: {
        items: 500,
        orders: 200,
        ai_credits: 500,
        features: {
            ai_price_suggestions: true,
            ai_descriptions: true,
            ai_discounts: true,
            social_posts: true,
            advanced_analytics: true,
            pdf_reports: true,
            multi_account: false,
            api_access: false,
            white_label: false,
            advanced_returns: true,
            google_sheets: true
        }
    },
    enterprise: {
        items: Infinity,
        orders: Infinity,
        ai_credits: 2000,
        features: {
            ai_price_suggestions: true,
            ai_descriptions: true,
            ai_discounts: true,
            social_posts: true,
            advanced_analytics: true,
            pdf_reports: true,
            multi_account: true,
            api_access: true,
            white_label: true,
            advanced_returns: true,
            google_sheets: true
        }
    }
};

export function hasFeatureAccess(user, featureName) {
    const plan = user?.subscription_plan || 'free';
    return PLAN_LIMITS[plan]?.features[featureName] || false;
}

export function canCreateItem(user, currentItemsCount) {
    const plan = user?.subscription_plan || 'free';
    const limit = PLAN_LIMITS[plan].items;
    return limit === Infinity || currentItemsCount < limit;
}

export function canCreateOrder(user, currentOrdersCount) {
    const plan = user?.subscription_plan || 'free';
    const limit = PLAN_LIMITS[plan].orders;
    return limit === Infinity || currentOrdersCount < limit;
}

export function canUseAI(user) {
    const aiUsed = user?.ai_credits_used || 0;
    const aiLimit = user?.ai_credits_limit || PLAN_LIMITS[user?.subscription_plan || 'free'].ai_credits;
    return aiUsed < aiLimit;
}