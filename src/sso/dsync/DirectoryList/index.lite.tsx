import { useStore, Show, onUpdate } from '@builder.io/mitosis';
import { DirectorySyncProviders, type Directory } from '../types';
import LoadingContainer from '../../../shared/LoadingContainer/index.lite';
import type { DirectoryListProps } from '../types';
import defaultClasses from './index.module.css';
import cssClassAssembler from '../../utils/cssClassAssembler';
import Table from '../../../shared/Table/index.lite';
import { BadgeProps, TableProps } from '../../../shared/types';
import EmptyState from '../../../shared/EmptyState/index.lite';

const DEFAULT_VALUES = {
  directoryListData: [] as Directory[],
};

export default function DirectoryList(props: DirectoryListProps) {
  const state = useStore({
    directoryListData: DEFAULT_VALUES.directoryListData,
    get providers() {
      return Object.entries<string>(DirectorySyncProviders)?.map(([value, text]) => ({
        value,
        text,
      }));
    },
    isDirectoryListLoading: true,
    directoryListIsLoading: true,
    get displayTenantProduct() {
      return props.setupLinkToken ? false : true;
    },
    get classes() {
      return {
        container: cssClassAssembler(props.classNames?.container, defaultClasses.container),
        table: cssClassAssembler(props.classNames?.table, defaultClasses.table),
        tableHead: cssClassAssembler(props.classNames?.tableHead, defaultClasses.tableHead),
        tableData: cssClassAssembler(props.classNames?.tableData, defaultClasses.tableData),
      };
    },
    get actions(): TableProps['actions'] {
      return [
        {
          icon: 'EyeIcon',
          label: 'View',
          handleClick: (directory: Directory) => props.handleActionClick('view', directory),
        },
        {
          icon: 'PencilIcon',
          label: 'Edit',
          handleClick: (directory: Directory) => props.handleActionClick('edit', directory),
        },
      ];
    },
    get colsToDisplay() {
      return (props.cols || ['tenant', 'name', 'type', 'status', 'actions']).map((_col) => {
        if (_col === 'status') {
          return {
            name: 'status',
            badge: {
              position: 'surround',
              variantSelector(rowData) {
                let _variant: BadgeProps['variant'];
                if (rowData.deactivated) {
                  _variant = 'warning';
                }
                if (!rowData.deactivated) {
                  _variant = 'success';
                }
                return _variant;
              },
            },
          };
        } else {
          return _col;
        }
      }) as TableProps['cols'];
    },
  });

  onUpdate(() => {
    async function getFieldsData(directoryListUrl: string) {
      // fetch request for obtaining directory lists data
      const directoryListResponse = await fetch(directoryListUrl);
      const { data: listData, error } = await directoryListResponse.json();

      const directoriesListData = listData?.map((directory: Directory) => {
        return {
          ...directory,
          id: directory.id,
          name: directory.name,
          tenant: directory.tenant,
          product: directory.product,
          type: state.providers.find(({ value }) => value === directory.type)?.text,
          status: directory.deactivated ? 'Inactive' : 'Active',
        };
      });

      state.directoryListIsLoading = false;

      if (error) {
        typeof props.errorCallback === 'function' && props.errorCallback(error.message);
      } else {
        state.directoryListData = directoriesListData;
        typeof props.handleListFetchComplete === 'function' && props.handleListFetchComplete(listData);
      }
    }
    getFieldsData(props.urls.get);
  }, [props.urls.get]);

  return (
    <Show
      when={state.directoryListIsLoading}
      else={
        <Show
          when={state.directoryListData.length > 0}
          else={
            <Show when={props.children} else={<EmptyState title='No directories found.' />}>
              {props.children}
            </Show>
          }>
          <div>
            <Table cols={state.colsToDisplay} data={state.directoryListData} actions={state.actions} />
          </div>
        </Show>
      }>
      <LoadingContainer isBusy={state.isDirectoryListLoading} />
    </Show>
  );
}
