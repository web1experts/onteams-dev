import React from 'react';
import { Form, ProgressBar } from 'react-bootstrap';
import DatePicker from "react-multi-date-picker";

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
    fieldId,
    range_options =  {}
  } = config;
  
  // const fieldId = `field-${name}`;

  const sharedProps = {
    name,
    // id: fieldId,
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

  let percentage = 0;
  if( type === 'range'){
    percentage  = ((value - range_options?.min) / (range_options?.max - range_options?.min)) * 100;
  }

  return (
    <Form.Group className="mb-3" controlId={fieldId}>
      {label && <Form.Label>{label}</Form.Label>}

      {/* Basic Inputs */}
      {['text', 'email', 'password'].includes(type) && (
        <Form.Control type={type} {...sharedProps} key={fieldId} />
      )}

      
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


      {/* Textarea */}
      {type === 'textarea' && (
        <Form.Control as="textarea" rows={3} {...sharedProps} key={fieldId} />
      )}

      {type ==='date' && (
        <Form.Control type="date" {...sharedProps} key={fieldId} />

      )}

      {/* Select */}
      {(type === 'select' || type === 'dropdown' || type === 'badge') && (
        <Form.Select {...sharedProps} key={fieldId} className='custom-selectbox'>
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
        options.map((opt, i) => (
          <Form.Check
            key={`radio-${fieldId}-${opt.value}`}
            id={`radio-${fieldId}-${opt.value}`}
            type="radio"
            name={name}
            label={opt.label}
            value={opt.value}
            checked={String(value) === String(opt.value)}
            onChange={onChange}
            inline={inline}
            disabled={disabled}
          />
        ))}

        {type === 'range' && 
          <>
            <Form.Range
              min={range_options?.min || 1}
              max={range_options?.max || 100}
              step={range_options?.steps || 1}
              {...sharedProps} key={fieldId}
            />
            <ProgressBar now={percentage} label={`${value}`} />  
          </>
        }


      {/* Multi-Checkbox */}
      {/* {type === 'checkbox' &&
        options.map((opt, i) => (
          <Form.Check
            key={`checkbox-${fieldId}-${i}-${opt.value}`}
            id={`checkbox-${fieldId}-${opt.value}`}
            type="checkbox"
            label={opt.label}
            name={`${name}`}
            value={opt.value}
            checked={String(value) === String(opt.value)}
            // onChange={(e) => {
            //   if (!onChange) return;
            //   const isChecked = e.target.checked;
            //   const newValue = isChecked
            //     ? [...(value || []), opt.value]
            //     : (value || []).filter((v) => v !== opt.value);
            //   onChange(name, newValue);
            // }}
            onChange={onChange}
            inline={inline}
            disabled={disabled}
          />
        ))} */}
    </Form.Group>
  );
}
