import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * Renders a dynamic form field based on config.
 * @param {Object} config - Field config object
 * @returns JSX.Element
 */
export function renderDynamicField(config) {
  const {
    name,
    type,
    label,
    options = [],
    value,
    defaultValue,
    onChange,
    onClick,
    onSelect,
    placeholder,
    inline = false,
    disabled = false,
    readOnly = false,
    required = false,
  } = config;

  const fieldId = `field-${name}`;

  const sharedProps = {
    name,
    id: fieldId,
    value,
    defaultValue,
    onChange,
    onClick,
    onSelect,
    placeholder,
    disabled,
    readOnly,
    required,
  };

  return (
    <Form.Group className="mb-3" controlId={fieldId}>
      {label && type !== 'checkbox' && <Form.Label>{label}</Form.Label>}

      {/* Basic Inputs */}
      {['text', 'email', 'password'].includes(type) && (
        <Form.Control type={type} {...sharedProps} />
      )}

      {/* Textarea */}
      {type === 'textarea' && (
        <Form.Control as="textarea" rows={3} {...sharedProps} />
      )}

      {/* Select */}
      {type === 'select' && (
        <Form.Select {...sharedProps}>
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      )}

      {/* Radio */}
      {type === 'radio' &&
        options.map((opt) => (
          <Form.Check
            key={opt.value}
            type="radio"
            name={name}
            label={opt.label}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            inline={inline}
            disabled={disabled}
          />
        ))}

      {/* Single Checkbox */}
      {type === 'checkbox' && (
        <Form.Check
          type="checkbox"
          label={label}
          name={name}
          checked={!!value}
          onChange={onChange}
          disabled={disabled}
          inline={inline}
        />
      )}

      {/* Multi-Checkbox */}
      {type === 'multi-checkbox' &&
        options.map((opt) => (
          <Form.Check
            key={opt.value}
            type="checkbox"
            label={opt.label}
            name={`${name}[]`}
            value={opt.value}
            checked={Array.isArray(value) && value.includes(opt.value)}
            onChange={(e) => {
              if (!onChange) return;
              const isChecked = e.target.checked;
              const newValue = isChecked
                ? [...(value || []), opt.value]
                : (value || []).filter((v) => v !== opt.value);
              onChange(name, newValue);
            }}
            inline={inline}
            disabled={disabled}
          />
        ))}
    </Form.Group>
  );
}
