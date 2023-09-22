import type { Directory, EditDirectoryProps, ApiResponse } from '../types';
import { useStore, onUpdate, Show } from '@builder.io/mitosis';
import ToggleConnectionStatus from '../ToggleConnectionStatus/index.lite';
import defaultClasses from './index.module.css';
import cssClassAssembler from '../../utils/cssClassAssembler';
import Button from '../../../shared/Button/index.lite';
import Spacer from '../../../shared/Spacer/index.lite';
import ConfirmationPrompt from '../../../shared/ConfirmationPrompt/index.lite';

type FormState = Pick<Directory, 'name' | 'log_webhook_events' | 'webhook' | 'google_domain'>;

const DEFAULT_VALUES: { formState: FormState; directory: Directory | null } = {
  formState: {
    name: '',
    log_webhook_events: false,
    webhook: {
      endpoint: '',
      secret: '',
    },
    google_domain: '',
  },
  directory: null,
};

export default function EditDirectory(props: EditDirectoryProps) {
  const state: any = useStore({
    loading: true,
    formState: DEFAULT_VALUES.formState,
    directory: DEFAULT_VALUES.directory,
    get classes() {
      return {
        label: cssClassAssembler(props.classNames?.label, defaultClasses.label),
        input: cssClassAssembler(props.classNames?.input, defaultClasses.input),
        container: cssClassAssembler(props.classNames?.container, defaultClasses.container),
        formDiv: cssClassAssembler(props.classNames?.formDiv, defaultClasses.formDiv),
        fieldsDiv: cssClassAssembler(props.classNames?.fieldsDiv, defaultClasses.fieldsDiv),
        section: cssClassAssembler(props.classNames?.section, defaultClasses.section),
      };
    },
    updateFormState(key: string, newValue: string | boolean, id: string) {
      if (id === 'webhook.endpoint' || id === 'webhook.secret') {
        return {
          ...state.formState,
          webhook: {
            ...state.formState?.webhook,
            [id.split('.')[1]]: newValue,
          },
        };
      }

      return {
        ...state.formState,
        [key]: newValue,
      };
    },
    handleChange(event: Event) {
      const target = event.target as HTMLInputElement;
      const name = target.name;
      const value = target.type === 'checkbox' ? target.checked : target.value;

      state.formState = state.updateFormState(name, value, target.id);
    },
    onSubmit(event: Event) {
      event.preventDefault();
      state.loading = true;

      async function sendHttpRequest(url: string) {
        const rawResponse = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(state.formState),
        });

        state.loading = false;

        const response: ApiResponse<Directory> = await rawResponse.json();

        if ('error' in response) {
          (typeof props.errorCallback === 'function') && props.errorCallback(response.error.message);
          return;
        }

        if (rawResponse.ok) {
          (typeof props.successCallback === 'function') && props.successCallback();
        }
      }
      sendHttpRequest(props.urls.patch);
    },
    deleteDirectory() {
      async function sendHTTPrequest(url: string) {
        const rawResponse = await fetch(url, {
          method: 'DELETE',
        });

        const response: ApiResponse<unknown> = await rawResponse.json();

        if ('error' in response) {
          (typeof props.errorCallback === 'function') && props.errorCallback(response.error.message);
          return;
        }

        if ('data' in response) {
          (typeof props.successCallback === 'function') && props.successCallback();
        }
      }

      sendHTTPrequest(props.urls.delete);
    }
  });

  onUpdate(() => {
    async function getDirectory(url: string) {
      const response = await fetch(url);
      const { data: directoryData, error } = await response.json();

      if (directoryData) {
        state.directory = directoryData;
        state.formState = {
          name: directoryData.name,
          log_webhook_events: directoryData.log_webhook_events,
          webhook: {
            endpoint: directoryData.webhook?.endpoint,
            secret: directoryData.webhook?.secret,
          },
          google_domain: directoryData.google_domain,
        };
      }

      if (error) {
        console.error(error);
      }
    }
    getDirectory(props.urls.get);
  }, [props.urls]);



  return (
    <div>
      <div class={defaultClasses.headingContainer}>
        <h2 className={defaultClasses.heading}>Update Directory</h2>
        <ToggleConnectionStatus
          connection={state.directory}
          urls={{ patch: props.urls.patch }}
          errorCallback={props.errorCallback}
          successCallback={props.successCallback}
        />
      </div>
      <div class={state.classes.container}>
        <form onSubmit={(event) => state.onSubmit(event)}>
          <div class={state.classes.formDiv}>
            <div class={state.classes.fieldsDiv}>
              <label for='name' class={state.classes.label}>
                <span class={defaultClasses.labelText}>Directory name</span>
              </label>
              <input
                type='text'
                id='name'
                name='name'
                class={state.classes.input}
                required={true}
                onChange={(event) => state.handleChange(event)}
                value={state.formState?.name}
              />
            </div>
            <Show when={state.directory?.type === 'google'}>
              <div class={state.classes.fieldsDiv}>
                <label for='google_domain' class={state.classes.label}>
                  <span class={defaultClasses.labelText}>Directory domain</span>
                </label>
                <input
                  type='text'
                  id='google_domain'
                  name='google_domain'
                  class={state.classes.input}
                  onChange={(event) => state.handleChange(event)}
                  value={state.formState?.google_domain}
                />
              </div>
            </Show>
            <div class={state.classes.fieldsDiv}>
              <label for='webhook.endpoint' class={state.classes.label}>
                <span class={defaultClasses.labelText}>Webhook URL</span>
              </label>
              <input
                type='text'
                id='webhook.endpoint'
                name='webhook.endpoint'
                class={state.classes.input}
                onChange={(event) => state.handleChange(event)}
                value={state.formState?.webhook.endpoint}
              />
            </div>
            <div class={state.classes.fieldsDiv}>
              <label for='webhook.secret' class={state.classes.label}>
                <span class={defaultClasses.labelText}>Webhook secret</span>
              </label>
              <input
                type='text'
                id='webhook.secret'
                name='webhook.secret'
                class={state.classes.input}
                onChange={(event) => state.handleChange(event)}
                value={state.formState?.webhook.secret}
              />
            </div>
            <div class={defaultClasses.checkboxFieldsDiv}>
              <div class='flex items-center'>
                <input
                  id='log_webhook_events'
                  name='log_webhook_events'
                  type='checkbox'
                  checked={state.formState?.log_webhook_events}
                  onChange={(event) => state.handleChange(event)}
                  class={defaultClasses.checkboxInput}
                />
                <label for='log_webhook_events' class={defaultClasses.checkboxLabel}>
                  Enable Webhook events logging
                </label>
              </div>
            </div>
            <Spacer y={4} />
            <div class={defaultClasses.formAction}>
              <Show when={typeof props.cancelCallback === 'function'}>
                <Button type='button' name='Cancel' handleClick={props.cancelCallback} variant='outline' />
              </Show>
              <Button type='submit' name='Save' variant='primary' />
            </div>
          </div>
        </form>
      </div>
      <section class={state.classes.section}>
        <div class={defaultClasses.info}>
          <h6 class={defaultClasses.sectionHeading}>Delete this directory connection</h6>
          <p class={defaultClasses.sectionPara}>All your apps using this connection will stop working.</p>
        </div>
        <ConfirmationPrompt
          promptMessge=' Are you sure you want to delete the directory connection? This will permanently delete the
              directory connection, users, and groups.'
          confirmationCallback={state.deleteDirectory}
        />
      </section>
    </div>
  );
}
