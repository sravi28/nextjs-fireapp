/**
 * Reusable component that displays different messages depending on validity of value
 *
 * @param props:
 *      value= value being validated
 *
 *      valueName= what is this value called (title, username, ...)
 *
 *      isValid= boolean indicating validity of value
 *
 *      loading= boolean indicating that we are waiting for validation
 * @returns paragraph
 */

interface Props {
  value: any;
  valueName: any;
  isValid: boolean;
  loading: any;
}
export default function InputValidationMessage({
  value,
  valueName,
  isValid,
  loading,
}: Props) {
  if (!value) {
    return <p>Waiting for input</p>;
  } else if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return (
      <p className="text-success">
        {'"'}
        {value}
        {'"'} is available!
      </p>
    );
  } else if (!isValid) {
    if (value) {
      if (value.length >= 3 && value.length <= 100) {
        return (
          <p className="text-danger">
            That {valueName.toLowerCase()} is taken :c
          </p>
        );
      } else {
        return (
          <p className="text-danger">
            Title must be between 3 and 100 characters, yours is {value.length}{" "}
            characters long
          </p>
        );
      }
    }
  } else {
    return <p></p>;
  }
}
