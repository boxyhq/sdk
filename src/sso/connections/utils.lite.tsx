import { onMount, onUpdate, useStore, Show, For } from '@builder.io/mitosis';
import { ButtonLink } from '@components/ButtonLink';
import { EditViewOnlyFields, getCommonFields } from './fieldCatalog';

export const saveConnection = async ({
  formObj,
  isEditView,
  connectionIsSAML,
  connectionIsOIDC,
  setupLinkToken,
  callback,
}: {
  formObj: FormObj;
  isEditView?: boolean;
  connectionIsSAML: boolean;
  connectionIsOIDC: boolean;
  setupLinkToken?: string;
  callback: (res: Response) => Promise<void>;
}) => {
  const {
    rawMetadata,
    redirectUrl,
    oidcDiscoveryUrl,
    oidcMetadata,
    oidcClientId,
    oidcClientSecret,
    metadataUrl,
    ...rest
  } = formObj;

  const encodedRawMetadata = btoa((rawMetadata as string) || '');
  const redirectUrlList = (redirectUrl as string)?.split(/\r\n|\r|\n/);

  const res = await fetch(
    setupLinkToken ? `/api/setup/${setupLinkToken}/sso-connection` : '/api/admin/connections',
    {
      method: isEditView ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...rest,
        encodedRawMetadata: connectionIsSAML ? encodedRawMetadata : undefined,
        oidcDiscoveryUrl: connectionIsOIDC ? oidcDiscoveryUrl : undefined,
        oidcMetadata: connectionIsOIDC ? oidcMetadata : undefined,
        oidcClientId: connectionIsOIDC ? oidcClientId : undefined,
        oidcClientSecret: connectionIsOIDC ? oidcClientSecret : undefined,
        redirectUrl: redirectUrl && redirectUrlList ? JSON.stringify(redirectUrlList) : undefined,
        metadataUrl: connectionIsSAML ? metadataUrl : undefined,
      }),
    }
  );
  callback(res);
};

export function fieldCatalogFilterByConnection(connection) {
  return ({ attributes }) =>
    attributes.connection && connection !== null ? attributes.connection === connection : true;
}

/** If a field item has a fallback attribute, only render it if the form state has the field item */
export function excludeFallback(formObj: FormObj) {
  return ({ key, fallback }: FieldCatalogItem) => {
    if (typeof fallback === 'object') {
      if (!(key in formObj)) {
        return false;
      }
    }
    return true;
  };
}

export function getHandleChange(setFormObj, opts: { key?: string; formObjParentKey?: string } = {}) {
  return (event: any) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    setFormObj((cur) =>
      opts.formObjParentKey
        ? {
            ...cur,
            [opts.formObjParentKey]: {
              ...(cur[opts.formObjParentKey] as FormObj),
              [target.id]: target[opts.key || 'value'],
            },
          }
        : { ...cur, [target.id]: target[opts.key || 'value'] }
    );
  };
}

export type FieldCatalogItem = {
  key: string;
  label?: string;
  type: 'url' | 'object' | 'pre' | 'text' | 'password' | 'textarea' | 'checkbox';
  placeholder?: string;
  attributes: fieldAttributes;
  members?: FieldCatalogItem[];
  fallback?: {
    key: string;
    activateCondition?: (fieldValue) => boolean;
    switch: { label: string; 'data-testid'?: string };
  };
};

type fieldAttributes = {
  required?: boolean;
  maxLength?: number;
  editable?: boolean;
  isArray?: boolean;
  rows?: number;
  accessor?: (any) => unknown;
  formatForDisplay?: (value) => string;
  isHidden?: (value) => boolean;
  showWarning?: (value) => boolean;
  hideInSetupView: boolean;
  connection?: string;
  'data-testid'?: string;
};

export type AdminPortalSSODefaults = {
  tenant: string;
  product: string;
  redirectUrl: string;
  defaultRedirectUrl: string;
};

type FormObjValues = string | boolean | string[];

export type FormObj = Record<string, FormObjValues | Record<string, FormObjValues>>;

export const useFieldCatalog = ({
  isEditView,
  isSettingsView,
}: {
  isEditView?: boolean;
  isSettingsView?: boolean;
}) => {
  // Replace the existing useMemo that limits the fieldCatalog just for react
  // OnMount filedCatalog caches a value and returns it
  // OnUpdate based on the dependency array field catalog value is reassigned
  let fieldCatalog = onMount(() => {
    if (isEditView) {
      return [...getCommonFields({ isEditView: true, isSettingsView }), ...EditViewOnlyFields];
    }
    return [...getCommonFields({ isSettingsView })];
  });

  fieldCatalog = onUpdate(() => {
    if (isEditView) {
      return [...getCommonFields({ isEditView: true, isSettingsView }), ...EditViewOnlyFields];
    }
    return [...getCommonFields({ isSettingsView })];
  }, [isEditView, isSettingsView]);

  return fieldCatalog;
};

export default function renderFieldList(args: {
  isEditView?: boolean;
  formObj: FormObj;
  setFormObj: any;
  formObjParentKey?: string;
  activateFallback: (activeKey, fallbackKey) => void;
}) {
  const FieldList = ({
    key,
    placeholder,
    label,
    type,
    members,
    attributes: {
      isHidden,
      isArray,
      rows,
      formatForDisplay,
      editable,
      maxLength,
      showWarning,
      required = true,
      'data-testid': dataTestId,
    },
    fallback,
  }: FieldCatalogItem) => {
    const state = useStore({
      disabled: editable === false,
      get value() {
        return state.disabled && typeof formatForDisplay === 'function'
          ? formatForDisplay(
              args.formObjParentKey ? args.formObj[args.formObjParentKey]?.[key] : args.formObj[key]
            )
          : args.formObjParentKey
          ? args.formObj[args.formObjParentKey]?.[key]
          : args.formObj[key];
      },
      get isHiddenClassName() {
        return typeof isHidden === 'function' && isHidden(args.formObj[key]) == true ? ' hidden' : '';
      },
      get fallbackLogic() {
        return typeof fallback.activateCondition === 'function' ? fallback.activateCondition(value) : true;
      },
    });

    return (
      <div>
        <Show when={type === 'object'}>
          <Show when={typeof fallback === 'object' && state.fallbackLogic}>
            <div key={key}>
              <ButtonLink
                className='mb-2 px-0'
                type='button'
                data-testid={fallback.switch['data-testid']}
                onClick={() => {
                  /** Switch to fallback.key*/
                  args.activateFallback(key, fallback.key);
                }}>
                {fallback.switch.label}
              </ButtonLink>
            </div>
          </Show>
        </Show>
        <Show when={type !== 'object'}>
          <div className='mb-6' key={key}>
            <Show when={type !== 'checkbox'}>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor={key}
                  className={
                    'mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300' + isHiddenClassName
                  }>
                  {label}
                </label>
                <Show
                  when={
                    typeof fallback === 'object' && typeof fallback.activateCondition === 'function'
                      ? fallback.activateCondition(value)
                      : true
                  }>
                  <ButtonLink
                    className='mb-2 px-0'
                    type='button'
                    data-testid={fallback.switch['data-testid']}
                    onClick={() => {
                      /** Switch to fallback.key*/
                      args.activateFallback(key, fallback.key);
                    }}>
                    {fallback.switch.label}
                  </ButtonLink>
                </Show>
              </div>
            </Show>
            <Show when={type === 'pre'}>
              <pre
                className={
                  'block w-full cursor-not-allowed overflow-auto rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500' +
                  state.isHiddenClassName +
                  (typeof showWarning === 'function' && showWarning(args.formObj[key])
                    ? ' border-2 border-rose-500'
                    : '')
                }
                data-testid={dataTestId}>
                {state.value}
              </pre>
            </Show>
            <Show when={type === 'textarea'}>
              <textarea
                id={key}
                placeholder={placeholder}
                value={(state.value as string) || ''}
                required={required}
                disabled={state.disabled}
                maxLength={maxLength}
                onChange={getHandleChange(args.setFormObj, { formObjParentKey: args.formObjParentKey })}
                className={
                  'textarea-bordered textarea h-24 w-full' +
                  (isArray ? ' whitespace-pre' : '') +
                  state.isHiddenClassName
                }
                rows={rows}
                data-testid={dataTestId}
              />
            </Show>
            <Show when={type === 'checkbox'}>
              <>
                <label
                  htmlFor={key}
                  className={
                    'inline-block align-middle text-sm font-medium text-gray-900 dark:text-gray-300' +
                    state.isHiddenClassName
                  }>
                  {label}
                </label>
                <input
                  id={key}
                  type={type}
                  checked={!!state.value}
                  required={required}
                  disabled={state.disabled}
                  maxLength={maxLength}
                  onChange={getHandleChange(args.setFormObj, {
                    key: 'checked',
                    formObjParentKey: args.formObjParentKey,
                  })}
                  className={'checkbox-primary checkbox ml-5 align-middle' + isHiddenClassName}
                  data-testid={dataTestId}
                />
              </>
            </Show>
            <Show when={type !== 'pre' && type !== 'textarea' && type !== 'checkbox'}>
              <input
                id={key}
                type={type}
                placeholder={placeholder}
                value={(state.value as string) || ''}
                required={required}
                disabled={state.disabled}
                maxLength={maxLength}
                onChange={getHandleChange(args.setFormObj, { formObjParentKey: args.formObjParentKey })}
                className={'input-bordered input w-full' + state.isHiddenClassName}
                data-testid={dataTestId}
              />
            </Show>
          </div>
        </Show>
      </div>
    );
  };

  return FieldList;
}
