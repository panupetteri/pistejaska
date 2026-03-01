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

interface InputNativeDateFieldProps {
  label: string;
  className?: string;
  id?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  inputRef?: Ref<HTMLInputElement>;
  value: string | null;
  onChange: (
    value: string | null,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  autoFocus?: boolean;
}

const InputNativeDateField: FC<InputNativeDateFieldProps> = (props) => {
  const {
    id,
    label,
    value,
    className,
    onChange,
    onFocus,
    inputRef,
    autoFocus,
  } = props;
  const inputId = useId("input-number-", id);
  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value.trim();
    onChange(value, event);
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
        type="date"
        value={value == null ? "" : value.toString()}
        onChange={onInputChange}
        onFocus={onFocus}
        ref={inputRef}
        autoFocus={autoFocus}
        autoComplete="off"
      />
    </FieldBase>
  );
};

export default InputNativeDateField;
