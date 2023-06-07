/**
 * @title Login Component without input display
 * @description Here we pass the ssoIdentifier directly instead of taking a user input.
 * @order 3
 */

import { Login } from '@boxyhq/react-ui/sso';

const PresetSSOIdentifier = () => {
  return (
    <Login
      onSubmit={async ({ ssoIdentifier, cb }) => {
        // initiate the SSO flow here
      }}
      ssoIdentifier='some-identifier'
      buttonText='SIGN IN WITH SSO'
    />
  );
};

export default PresetSSOIdentifier;
