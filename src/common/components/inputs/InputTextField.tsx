import {
  ChangeEvent,
  ChangeEventHandler,
  FocusEventHandler,
  Ref,
  FC,
} from "react";
import useId from "../../hooks/useId";
import FieldBase from "./FieldBase";
import fieldStyles from "./FieldBase.module.css";

interface InputTextFieldProps {
  label: string;
  className?: string;
  id?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  inputRef?: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  centered?: boolean;
  unbordered?: boolean;
  required?: boolean;
  type?: "text" | "url" | "email";
}

const InputTextField: FC<InputTextFieldProps> = (props) => {
  const {
    id,
    label,
    value,
    className,
    onChange,
    onFocus,
    inputRef,
    autoFocus,
    centered,
    unbordered,
    required = false,
    type = "text",
  } = props;
  const inputId = useId("input-text-", id);
  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    onChange(value, event);
  };
  return (
    <FieldBase
      className={className}
      label={label}
      labelFor={inputId}
      hasValue={!!value}
      centered={centered}
      unbordered={unbordered}
    >
      <input
        id={inputId}
        className={fieldStyles.input}
        type={type}
        value={value == null ? "" : value.toString()}
        onChange={onInputChange}
        onFocus={onFocus}
        ref={inputRef}
        autoFocus={autoFocus}
        autoComplete="off"
        required={required}
      />
    </FieldBase>
  );
};

export default InputTextField;
