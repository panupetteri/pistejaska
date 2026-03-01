import classNames from "classnames";
import { ChangeEvent, FC } from "react";
import styles from "./CheckboxField.module.css";

interface CheckboxFieldProps {
  id?: string;
  className?: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxField: FC<CheckboxFieldProps> = (props) => {
  const { id, className, label, checked, onChange } = props;
  return (
    <label className={classNames(styles.label, className)}>
      <span className={styles.checkbox}>
        <input
          id={id}
          onChange={(event) => onChange(event.target.checked, event)}
          type="checkbox"
          checked={checked}
          className={styles.input}
        />
        <svg
          className={checked ? styles.checkedMark : styles.uncheckedMark}
          focusable="false"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {checked ? (
            <path
              fill="currentColor"
              d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          ) : (
            <path
              fill="currentColor"
              d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
            />
          )}
        </svg>
      </span>
      <span className="text-base text-inherit ml-2">{label}</span>
    </label>
  );
};

export default CheckboxField;
