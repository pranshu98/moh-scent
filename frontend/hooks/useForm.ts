import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: string) => boolean | string;
}

interface FormErrors {
  [key: string]: string;
}

interface UseFormProps<T> {
  initialValues: T;
  validationRules?: { [K in keyof T]?: ValidationRules };
  onSubmit: (values: T) => void | Promise<void>;
}

export const useForm = <T extends { [key: string]: any }>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: string): string => {
      const rules = validationRules[name];
      if (!rules) return '';

      if (rules.required && !value) {
        return 'This field is required';
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum length is ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Maximum length is ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Invalid format';
      }

      if (rules.validate) {
        const validationResult = rules.validate(value);
        if (typeof validationResult === 'string') {
          return validationResult;
        }
        if (!validationResult) {
          return 'Invalid value';
        }
      }

      return '';
    },
    [validationRules]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const error = validateField(key as keyof T, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      
      if (touched[name]) {
        const error = validateField(name as keyof T, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name as keyof T, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      if (validateForm()) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    },
    [values, validateForm, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name as string]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
  };
};

// Common validation rules
export const validationRules = {
  required: {
    required: true,
  },
  email: {
    required: true,
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  },
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  },
  phone: {
    pattern: /^\+?[\d\s-]{10,}$/,
  },
  postalCode: {
    pattern: /^[0-9]{5,6}$/,
  },
};

export default useForm;
