import { Show, onUpdate, useStore } from '@builder.io/mitosis';
import {
  type CreateDirectoryProps,
  type Directory,
  type UnSavedDirectory,
  DirectorySyncProviders,
} from '../types';
import defaultClasses from './index.module.css';
import cssClassAssembler from '../../sso/utils/cssClassAssembler';
import Button from '../../shared/Button/index.lite';
import Spacer from '../../shared/Spacer/index.lite';
import Select from '../../shared/Select/index.lite';
import InputField from '../../shared/inputs/InputField/index.lite';
import SecretInputFormControl from '../../shared/inputs/SecretInputFormControl/index.lite';
import { sendHTTPRequest } from '../../shared/http';
import Checkbox from '../../shared/Checkbox/index.lite';

const DEFAULT_DIRECTORY_VALUES: UnSavedDirectory = {
  name: '',
  tenant: '',
  product: '',
  webhook_url: '',
  webhook_secret: '',
  type: 'azure-scim-v2',
  google_domain: '',
  log_webhook_events: false,
};

type Keys = keyof typeof DEFAULT_DIRECTORY_VALUES;
type Values = (typeof DEFAULT_DIRECTORY_VALUES)[Keys];

export default function CreateDirectory(props: CreateDirectoryProps) {
  const state = useStore({
    directory: DEFAULT_DIRECTORY_VALUES,
    showDomain: false,
    isSaving: false,
    get providers() {
      return Object.entries<string>(DirectorySyncProviders)?.map(([value, text]) => ({
        value,
        text,
      }));
    },
    setProvider(event: any) {
      const _val = event?.target?.value;
      if (_val === 'google') {
        state.showDomain = true;
      } else {
        state.showDomain = false;
      }
      state.directory = { ...state.directory, type: _val };
    },
    get classes() {
      return {
        fieldContainer: cssClassAssembler(props.classNames?.fieldContainer, defaultClasses.fieldContainer),
        label: cssClassAssembler(props.classNames?.label, defaultClasses.label),
        inputField: {
          label: props.classNames?.label,
          input: props.classNames?.input,
          container: props.classNames?.fieldContainer,
        },
      };
    },
    get shouldDisplayHeader() {
      if (props.displayHeader !== undefined) {
        return props.displayHeader;
      }
      return true;
    },
    updateDirectory(data: Partial<typeof DEFAULT_DIRECTORY_VALUES>) {
      return { ...state.directory, ...data };
    },
    handleChange(event: Event) {
      const target = event.target as HTMLInputElement;
      const value = target.type === 'checkbox' ? target.checked : target.value;

      state.directory = state.updateDirectory({ [target.id as Keys]: value });
    },
    onSubmit(event: Event) {
      event.preventDefault();
      async function saveDirectory(body: any, url: string) {
        state.isSaving = true;
        const response = await sendHTTPRequest<{ data: Directory }>(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        state.isSaving = false;
        if (response) {
          if ('error' in response && response.error) {
            typeof props.errorCallback === 'function' && props.errorCallback(response.error.message);
          } else if ('data' in response) {
            typeof props.successCallback === 'function' &&
              props.successCallback({ operation: 'CREATE', connection: response.data });
          }
        }
      }
      saveDirectory(state.directory, props.urls.post);
    },
    isExcluded(fieldName: keyof UnSavedDirectory) {
      return !!(props.excludeFields as (keyof UnSavedDirectory)[])?.includes(fieldName);
    },
  });

  onUpdate(() => {
    state.directory = state.updateDirectory({
      tenant: props.tenant ?? state.directory.tenant,
      product: props.product ?? state.directory.product,
      webhook_url: props.defaultWebhookEndpoint ?? state.directory.webhook_url,
    });
  }, [props.tenant, props.product, props.defaultWebhookEndpoint]);

  return (
    <div>
      <Show when={state.shouldDisplayHeader}>
        <h2 class={defaultClasses.heading}>Create Directory</h2>
      </Show>
      <form onSubmit={(event) => state.onSubmit(event)}>
        <Show when={!state.isExcluded('name')}>
          <InputField
            label='Directory name'
            id='name'
            name='name'
            value={state.directory.name}
            handleInputChange={state.handleChange}
            required
            classNames={state.classes.inputField}
          />
          <Spacer y={6} />
        </Show>
        <Show when={!state.isExcluded('type')}>
          <div class={state.classes.fieldContainer}>
            <Select
              label='Directory provider'
              options={state.providers}
              selectedValue={state.directory.type}
              handleChange={state.setProvider}
              name='type'
              id='type'
            />
            <Spacer y={6} />
          </div>
        </Show>
        <Show when={state.showDomain}>
          <InputField
            label='Directory domain'
            id='google_domain'
            name='google_domain'
            value={state.directory.google_domain || ''}
            handleInputChange={state.handleChange}
            pattern={`^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$`}
            title='Please enter a valid domain (e.g: boxyhq.com)'
            classNames={state.classes.inputField}
          />
          <Spacer y={6} />
        </Show>
        <Show when={!state.isExcluded('tenant')}>
          <InputField
            label='Tenant'
            id='tenant'
            name='tenant'
            value={state.directory.tenant}
            handleInputChange={state.handleChange}
            required
            classNames={state.classes.inputField}
          />
          <Spacer y={6} />
        </Show>
        <Show when={!state.isExcluded('product')}>
          <InputField
            label='Product'
            id='product'
            name='product'
            value={state.directory.product}
            handleInputChange={state.handleChange}
            required
            classNames={state.classes.inputField}
          />
          <Spacer y={6} />
        </Show>
        <Show when={!state.isExcluded('webhook_url')}>
          <InputField
            type='url'
            label='Webhook URL'
            id='webhook_url'
            name='webhook_url'
            value={state.directory.webhook_url}
            handleInputChange={state.handleChange}
            classNames={state.classes.inputField}
          />
          <Spacer y={6} />
        </Show>
        <Show when={!state.isExcluded('webhook_secret')}>
          <SecretInputFormControl
            label='Webhook secret'
            id='webhook_secret'
            name='webhook_secret'
            value={state.directory.webhook_secret}
            handleChange={state.handleChange}
            classNames={state.classes.inputField}
            required={false}
            readOnly={false}
          />
          <Spacer y={6} />
        </Show>
        <Show when={!state.isExcluded('log_webhook_events')}>
          <div class={defaultClasses.checkboxFieldsDiv}>
            <Checkbox
              label='Enable Webhook events logging'
              id='log_webhook_events'
              name='log_webhook_events'
              checked={state.directory.log_webhook_events}
              handleChange={state.handleChange}
            />
            <Spacer y={6} />
          </div>
        </Show>
        <div class={defaultClasses.formAction}>
          <Show when={typeof props.cancelCallback === 'function'}>
            <Button type='button' name='Cancel' handleClick={props.cancelCallback} variant='outline' />
          </Show>
          <Button
            variant='primary'
            type='submit'
            name='Create Directory'
            classNames={props.classNames?.button?.ctoa}
            isLoading={state.isSaving}
          />
        </div>
      </form>
    </div>
  );
}
