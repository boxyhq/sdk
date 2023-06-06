/**
 * @title Login Component with custom styling
 * @description Refer the code below to see the passed props. Also supported is the passing of style attribute for each inner element (Note that inline style will override other styles).
 * @order 1
 */

import { Login } from '@boxyhq/react-ui/sso';
import './CustomStyling.css';

const CustomStyling = () => {
  return (
    <Login
      onSubmit={async ({ ssoIdentifier, cb }) => {
        // initiate the SSO flow here
      }}
      styles={{
        input: { borderColor: '#ebedf0' },
        button: { padding: '.85rem' },
      }}
      classNames={{ button: 'btn', input: 'inp' }}
      placeholder='contoso@boxyhq.com'
      inputLabel='Team Domain *'
      buttonText='Login with SSO'
      innerProps={{ input: { type: 'email' } }}
    />
  );
};

export default CustomStyling;
