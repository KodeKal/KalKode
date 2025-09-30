// src/utils/inputValidation.js

/**
 * Validation rules for shop and item fields
 */
export const VALIDATION_RULES = {
  shop: {
    name: {
      minLength: 1,
      maxLength: 50,
      required: true,
      label: 'Shop Name'
    },
    description: {
      minLength: 0,
      maxLength: 200,
      required: false,
      label: 'Shop Description'
    },
    mission: {
      minLength: 0,
      maxLength: 500,
      required: false,
      label: 'Mission Statement'
    }
  },
  item: {
    name: {
      minLength: 1,
      maxLength: 60,
      required: true,
      label: 'Item Name'
    },
    price: {
      minLength: 0,
      maxLength: 20,
      required: false,
      label: 'Price',
      pattern: /^[\d.,\s$€£¥₹]*$/,
      patternMessage: 'Price can only contain numbers, decimals, and currency symbols'
    },
    description: {
      minLength: 0,
      maxLength: 500,
      required: false,
      label: 'Item Description'
    },
    address: {
      minLength: 0,
      maxLength: 200,
      required: false,
      label: 'Address'
    }
  }
};

/**
 * Validate a field value against its rules
 * @param {string} value - The value to validate
 * @param {object} rules - The validation rules
 * @returns {object} - { isValid, error, charCount, charLimit }
 */
export const validateField = (value, rules) => {
  const charCount = value ? value.length : 0;
  const charLimit = rules.maxLength;

  // Check required
  if (rules.required && (!value || value.trim().length === 0)) {
    return {
      isValid: false,
      error: `${rules.label} is required`,
      charCount,
      charLimit
    };
  }

  // Check min length
  if (rules.minLength && value && value.length < rules.minLength) {
    return {
      isValid: false,
      error: `${rules.label} must be at least ${rules.minLength} characters`,
      charCount,
      charLimit
    };
  }

  // Check max length
  if (rules.maxLength && value && value.length > rules.maxLength) {
    return {
      isValid: false,
      error: `${rules.label} cannot exceed ${rules.maxLength} characters`,
      charCount,
      charLimit
    };
  }

  // Check pattern
  if (rules.pattern && value && !rules.pattern.test(value)) {
    return {
      isValid: false,
      error: rules.patternMessage || `${rules.label} format is invalid`,
      charCount,
      charLimit
    };
  }

  return {
    isValid: true,
    error: null,
    charCount,
    charLimit
  };
};

/**
 * Validate all shop fields
 * @param {object} shopData - The shop data object
 * @returns {object} - { isValid, errors }
 */
export const validateShopData = (shopData) => {
  const errors = {};
  let isValid = true;

  // Validate shop name
  const nameValidation = validateField(shopData.name, VALIDATION_RULES.shop.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
    isValid = false;
  }

  // Validate shop description
  const descValidation = validateField(shopData.description, VALIDATION_RULES.shop.description);
  if (!descValidation.isValid) {
    errors.description = descValidation.error;
    isValid = false;
  }

  // Validate mission
  const missionValidation = validateField(shopData.mission, VALIDATION_RULES.shop.mission);
  if (!missionValidation.isValid) {
    errors.mission = missionValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Validate a single item
 * @param {object} item - The item object
 * @returns {object} - { isValid, errors }
 */
export const validateItem = (item) => {
  const errors = {};
  let isValid = true;

  // Validate item name
  const nameValidation = validateField(item.name, VALIDATION_RULES.item.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
    isValid = false;
  }

  // Validate price
  const priceValidation = validateField(item.price, VALIDATION_RULES.item.price);
  if (!priceValidation.isValid) {
    errors.price = priceValidation.error;
    isValid = false;
  }

  // Validate description
  const descValidation = validateField(item.description, VALIDATION_RULES.item.description);
  if (!descValidation.isValid) {
    errors.description = descValidation.error;
    isValid = false;
  }

  // Validate address
  const addressValidation = validateField(item.address, VALIDATION_RULES.item.address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Validate all items in an array
 * @param {array} items - Array of item objects
 * @returns {object} - { isValid, itemErrors }
 */
export const validateAllItems = (items) => {
  const itemErrors = {};
  let isValid = true;

  items.forEach((item) => {
    const validation = validateItem(item);
    if (!validation.isValid) {
      itemErrors[item.id] = validation.errors;
      isValid = false;
    }
  });

  return { isValid, itemErrors };
};

/**
 * Get remaining characters for a field
 * @param {string} value - Current value
 * @param {number} maxLength - Maximum allowed length
 * @returns {number} - Remaining characters
 */
export const getRemainingChars = (value, maxLength) => {
  const currentLength = value ? value.length : 0;
  return Math.max(0, maxLength - currentLength);
};

/**
 * Truncate value to max length
 * @param {string} value - Value to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated value
 */
export const truncateToMaxLength = (value, maxLength) => {
  if (!value) return value;
  return value.slice(0, maxLength);
};

/**
 * Format character count display
 * @param {number} current - Current character count
 * @param {number} max - Maximum characters
 * @returns {string} - Formatted string
 */
export const formatCharCount = (current, max) => {
  const remaining = max - current;
  const percentage = (current / max) * 100;
  
  if (remaining < 0) {
    return `${Math.abs(remaining)} over limit`;
  }
  
  if (percentage >= 90) {
    return `${remaining} left`;
  }
  
  return `${current}/${max}`;
};

/**
 * Get validation status color
 * @param {number} current - Current character count
 * @param {number} max - Maximum characters
 * @returns {string} - Color code
 */
export const getValidationColor = (current, max) => {
  const percentage = (current / max) * 100;
  
  if (current > max) return '#ff4444'; // Red - over limit
  if (percentage >= 90) return '#ffaa00'; // Orange - near limit
  if (percentage >= 75) return '#ffdd00'; // Yellow - warning
  return '#00ff00'; // Green - ok
};

export default {
  VALIDATION_RULES,
  validateField,
  validateShopData,
  validateItem,
  validateAllItems,
  getRemainingChars,
  truncateToMaxLength,
  formatCharCount,
  getValidationColor
};