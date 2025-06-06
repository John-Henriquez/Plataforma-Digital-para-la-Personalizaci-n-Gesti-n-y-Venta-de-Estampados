import { useForm } from 'react-hook-form';
import { useState } from 'react';
import './../styles/components/Form.css';
import HideIcon from '../assets/HideIcon.svg';
import ViewIcon from '../assets/ViewIcon.svg';

const Form = ({ title, fields, buttonText, onSubmit, footerContent, backgroundColor }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);

    const onFormSubmit = (data) => onSubmit(data);

    return (
        <form
            className="form"
            style={{ backgroundColor }}
            onSubmit={handleSubmit(onFormSubmit)}
            autoComplete="off"
        >
            {title && <h1 className="form__title">{title}</h1>}

            {fields.map((field, index) => (
                <div className="form__group" key={index}>
                    {field.label && (
                        <label className="form__label" htmlFor={field.name}>
                            {field.label}
                        </label>
                    )}

                    {field.fieldType === 'input' && (
                        <input
                            {...register(field.name, {
                                required: field.required ? 'Este campo es obligatorio' : false,
                                minLength: field.minLength ? { value: field.minLength, message: `Debe tener al menos ${field.minLength} caracteres` } : false,
                                maxLength: field.maxLength ? { value: field.maxLength, message: `Debe tener máximo ${field.maxLength} caracteres` } : false,
                                pattern: field.pattern ? { value: field.pattern, message: field.patternMessage || 'Formato no válido' } : false,
                                validate: field.validate || {},
                            })}
                            id={field.name}
                            name={field.name}
                            placeholder={field.placeholder}
                            type={
                                field.type === 'password' && field.name === 'password'
                                    ? showPassword ? 'text' : 'password'
                                    : field.type === 'password' && field.name === 'newPassword'
                                        ? showNewPassword ? 'text' : 'password'
                                        : field.type
                            }
                            className={`form__input ${['email', 'password', 'rut', 'nombreCompleto', 'rol'].includes(field.name) ? 'form__input--with-icon' : ''}`}
                            defaultValue={field.defaultValue || ''}
                            disabled={field.disabled}
                            onChange={field.onChange}
                        />
                    )}

                    {field.fieldType === 'textarea' && (
                        <textarea
                            {...register(field.name, {
                                required: field.required ? 'Este campo es obligatorio' : false,
                                minLength: field.minLength ? { value: field.minLength, message: `Debe tener al menos ${field.minLength} caracteres` } : false,
                                maxLength: field.maxLength ? { value: field.maxLength, message: `Debe tener máximo ${field.maxLength} caracteres` } : false,
                                validate: field.validate || {},
                            })}
                            name={field.name}
                            className="form__textarea"
                            placeholder={field.placeholder}
                            defaultValue={field.defaultValue || ''}
                            disabled={field.disabled}
                            onChange={field.onChange}
                        />
                    )}

                    {field.fieldType === 'select' && (
                        <select
                            {...register(field.name, {
                                required: field.required ? 'Este campo es obligatorio' : false,
                                validate: field.validate || {},
                            })}
                            name={field.name}
                            className="form__select"
                            defaultValue={field.defaultValue || ''}
                            disabled={field.disabled}
                            onChange={field.onChange}
                        >
                            <option value="">Seleccionar opción</option>
                            {field.options?.map((option, i) => (
                                <option key={i} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Íconos para password */}
                    {field.type === 'password' && field.name === 'password' && (
                        <span className="toggle-password-icon" onClick={togglePasswordVisibility}>
                            <img src={showPassword ? ViewIcon : HideIcon} alt="toggle" />
                        </span>
                    )}
                    {field.type === 'password' && field.name === 'newPassword' && (
                        <span className="toggle-password-icon" onClick={toggleNewPasswordVisibility}>
                            <img src={showNewPassword ? ViewIcon : HideIcon} alt="toggle" />
                        </span>
                    )}

                    {/* Errores */}
                    <span className={`form__error-message ${errors[field.name] || field.errorMessageData ? 'visible' : ''}`}>
                        {errors[field.name]?.message || field.errorMessageData}
                    </span>
                </div>
            ))}

            {buttonText && <button className="form__button" type="submit">{buttonText}</button>}

            {footerContent && <div className="form__footer">{footerContent}</div>}
        </form>
    );
};

export default Form;
