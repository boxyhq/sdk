/**
 * @title Login Component without input display
 * @description Here we pass the ssoIdentifier directly instead of taking a user input.
 * @order 3
 */

import { sso } from '@boxyhq/react-ui';

const { Login } = sso;

const Demo3 = () => {
  return (
    <Login
      onSubmit={async (ssoIdentifier) => {
        // initiate the SSO flow here
      }}
      ssoIdentifier='some-identifier'
      buttonText='SIGN IN WITH SSO'
    />
  );
};

export default Demo3;
