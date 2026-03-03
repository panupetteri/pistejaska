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
import { IconClose } from "../icons/IconClose";

interface InputTextFieldProps {
  label: string;
  className?: string;
  id?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  inputRef?: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
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
    onClear,
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
      {onClear && value && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 mt-1.5"
          onClick={(e) => {
            e.preventDefault();
            onClear();
          }}
          type="button"
          aria-label="Clear"
        >
          <IconClose className="h-5 w-5" />
        </button>
      )}
    </FieldBase>
  );
};

export default InputTextField;
