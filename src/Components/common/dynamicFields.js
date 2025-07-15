import React, {useState} from 'react';
import { Form, ProgressBar, Modal , ListGroup} from 'react-bootstrap';
import DatePicker from "react-multi-date-picker";
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { FaChevronDown, FaCircle, FaCheck } from 'react-icons/fa';
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
    range_options =  {},
    showPassword,
    toggleShowPassword,
    toggleBadges

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
console.log('Value:: ', value)
  let filteredStatuses = options || []

  let percentage = 0;
  if( type === 'range'){
    percentage  = ((value - range_options?.min) / (range_options?.max - range_options?.min)) * 100;
  }

  const handleSearch = ({target: {value}}) => {
    filteredStatuses = options.filter(status => 
      status.label.toLowerCase().includes(value.toLowerCase())
    );
  }

  return (
    <Form.Group className="mb-3" controlId={fieldId}>
      {(type !== "badge" && label) && (<Form.Label label={label}>{label}</Form.Label>)}

      {/* Basic Inputs */}
      {['text', 'email'].includes(type) && (
        <Form.Control type={type} {...sharedProps} key={fieldId} />
      )}
      {type === 'password' && (
        <div className="position-relative">
            <Form.Control
                type={showPassword ? 'text' : 'password'}
                {...sharedProps}
                key={fieldId}
            />
            <span
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#999'
                }}
                onClick={toggleShowPassword}
            >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
            </span>
        </div>
    )}

      {['phone'].includes(type) && (
        <Form.Control type='tel' {...sharedProps} key={fieldId} />
      )}

      
      {/* Single Checkbox */}
      {type === 'checkbox' && Array.isArray(options) && options.length > 0 && (
        <>
          {options.length === 1 ? (
            <Form.Check
              type="checkbox"
              label={options[0].label}
              name={name}
              value={options[0].value}
              checked={!!value}
              onChange={onChange}
              disabled={disabled}
              inline={inline}
            />
          ) : (
            options.map((option, index) => (
              <Form.Check
                key={index}
                type="checkbox"
                label={option.label}
                name={`${name}[]`}
                value={option.value}
                checked={Array.isArray(value) ? value.includes(option.value) : false}
                onChange={onChange}
                disabled={disabled}
                inline={inline}
              />
            ))
          )}
        </>
      )}



      {/* Textarea */}
      {type === 'textarea' && (
        <Form.Control as="textarea" rows={3} {...sharedProps} key={fieldId} />
      )}

      {type ==='date' && (
        <DatePicker 
          weekStartDayIndex={1}
          format="YYYY-MM-DD"
          // range
          // numberOfMonths={2}
          dateSeparator=" - " 
          {...sharedProps} 
          key={fieldId}
          editable={false}         
          className="form-control"
          placeholder="dd/mm/yyyy"/>

      )}

      {/* Select */}
      {(type === 'select' || type === 'dropdown') && (
        <Form.Select {...sharedProps} key={fieldId} className='custom-selectbox'>
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      )}

      {(type === 'badge') && (
        <>
        <Form.Label>
            <small>{label}</small>
            <div className="status--modal" onClick={toggleBadges}>
                {value || 'Select'} <FaChevronDown />
            </div>
        </Form.Label>
        </>
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
            <div className="d-flex justify-content-between">
                <small>{range_options?.min || 1}</small>
                <small>{range_options?.max || 100}</small>
            </div>
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
