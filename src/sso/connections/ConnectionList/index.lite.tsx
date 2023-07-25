import { useStore, Show, Slot, onMount, For } from '@builder.io/mitosis';
import type { ConnectionListProps, OIDCSSORecord, SAMLSSORecord } from '../types';
import Loading from '../../../shared/Loading/index.lite';
import EmptyState from '../../../shared/EmptyState/index.lite';
import Badge from '../../../shared/Badge/index.lite';
import IconButton from '../../../shared/IconButton/index.lite';
import cssClassAssembler from '../../utils/cssClassAssembler';
import defaultClasses from './index.module.css';
import PencilIcon from '../../../shared/icons/PencilIcon.lite';

const DEFAULT_VALUES = {
  isSettingsView: false,
  connectionListData: [] as ((SAMLSSORecord | OIDCSSORecord) & { isSystemSSO?: boolean })[],
};

export default function ConnectionList(props: ConnectionListProps) {
  const state = useStore({
    get displayTenantProduct() {
      return props.setupLinkToken ? false : true;
    },
    connectionListData: DEFAULT_VALUES.connectionListData,
    connectionListError: '',
    connectionListIsLoading: true,
    get classes() {
      return {
        container: cssClassAssembler(props.classNames?.container, defaultClasses.container),
        formControl: cssClassAssembler(props.classNames?.formControl, defaultClasses.formControl),
        tableContainer: cssClassAssembler(props.classNames?.tableContainer, defaultClasses.tableContainer),
        table: cssClassAssembler(props.classNames?.table, defaultClasses.table),
        thead: cssClassAssembler(props.classNames?.thead, defaultClasses.thead),
        tr: cssClassAssembler(props.classNames?.tr, defaultClasses.tr),
        th: cssClassAssembler(props.classNames?.th, defaultClasses.th),
        connectionListContainer: cssClassAssembler(
          props.classNames?.connectionListContainer,
          defaultClasses.connectionListContainer
        ),
        td: cssClassAssembler(props.classNames?.td, defaultClasses.td),
        badgeClass: cssClassAssembler(props.classNames?.badgeClass, defaultClasses.badgeClass),
        spanIcon: cssClassAssembler(props.classNames?.spanIcon, defaultClasses.spanIcon),
        icon: cssClassAssembler(props.classNames?.icon, defaultClasses.icon),
      };
    },
    connectionDisplayName(connection: SAMLSSORecord | OIDCSSORecord) {
      if (connection.name) {
        return connection.name;
      }

      if ('idpMetadata' in connection) {
        return connection.idpMetadata.friendlyProviderName || connection.idpMetadata.provider;
      }

      if ('oidcProvider' in connection) {
        return connection.oidcProvider.provider;
      }

      return 'Unknown';
    },
  });

  onMount(() => {
    async function getFieldsData() {
      const response = await fetch(props.getConnectionsUrl);
      const { data, error } = await response.json();
      state.connectionListData = data;
      if (error) {
        state.connectionListError = error;
      }
      state.connectionListIsLoading = false;
    }
    getFieldsData();
  });

  return (
    <Show
      when={state.connectionListIsLoading}
      else={
        <div>
          <Show
            when={state.connectionListData?.length > 0}
            else={<EmptyState title='No connections found.' />}>
            <div class={state.classes.tableContainer}>
              <table class={state.classes.table}>
                <thead class={state.classes.thead}>
                  <tr class={state.classes.tr}>
                    <th scope='col' class={state.classes.th}>
                      name
                    </th>
                    <Show when={state.displayTenantProduct}>
                      <th scope='col' class={state.classes.th}>
                        tenant
                      </th>
                      <th scope='col' class={state.classes.th}>
                        product
                      </th>
                    </Show>
                    <th scope='col' class={state.classes.th}>
                      idp type
                    </th>
                    <th scope='col' class={state.classes.th}>
                      status
                    </th>
                    <th scope='col' class={state.classes.th}>
                      actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <For each={state.connectionListData}>
                    {(connection, index) => (
                      <tr key={index} class={state.classes.connectionListContainer}>
                        <td class={state.classes.td}>
                          {state.connectionDisplayName(connection)}
                          <Show when={connection.isSystemSSO}>
                            <Badge
                              color='info'
                              ariaLabel='is an sso connection for the admin portal'
                              size='xs'
                              className={state.classes.badgeClass}>
                              system
                            </Badge>
                          </Show>
                        </td>
                        <Show when={state.displayTenantProduct}>
                          <td class={state.classes.td}>{connection.tenant}</td>
                          <td class={state.classes.td}>{connection.product}</td>
                        </Show>
                        <td class={state.classes.td}>
                          <Show when={'oidcProvider' in connection}>OIDC</Show>
                          <Show when={'idpMetadata' in connection}>SAML</Show>
                        </td>
                        <td class={state.classes.td}>
                          <Show
                            when={connection.deactivated}
                            else={
                              <Badge color='black' size='md'>
                                Active
                              </Badge>
                            }>
                            <Badge color='red' size='md'>
                              Inactive
                            </Badge>
                          </Show>
                        </td>
                        <td class={state.classes.td}>
                          <span class={state.classes.spanIcon}>
                            <IconButton
                              Icon={PencilIcon}
                              iconClasses={state.classes.icon}
                              data-testid='edit'
                              onClick={() => {
                                props.onIconClick();
                              }}
                            />
                          </span>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </div>
      }>
      <Loading />
    </Show>
  );
}
