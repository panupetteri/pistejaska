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

interface InputNumberFieldProps {
  label: string;
  className?: string;
  id?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  inputRef?: Ref<HTMLInputElement>;
  value: number | null;
  onChange: (
    value: number | null,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  min?: number;
  max?: number;
  step?: number;
  autoFocus?: boolean;
  required?: boolean;
}

const InputNumberField: FC<InputNumberFieldProps> = (props) => {
  const {
    id,
    label,
    value,
    className,
    onChange,
    onFocus,
    inputRef,
    autoFocus,
    required = false,
  } = props;
  const inputId = useId("input-number-", id);
  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value.trim();
    const numeric = value === "" ? null : +value;
    onChange(Number.isFinite(numeric) ? numeric : null, event);
  };
  return (
    <FieldBase
      className={className}
      label={label}
      labelFor={inputId}
      hasValue={value != null}
    >
      <input
        id={inputId}
        className={fieldStyles.input}
        type="number"
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

export default InputNumberField;
