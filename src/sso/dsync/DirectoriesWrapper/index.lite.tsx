import { useStore, Show } from '@builder.io/mitosis';
import type { Directory, DirectoriesWrapperProps } from '../types';
import CreateDirectory from '../CreateDirectory/index.lite';
import Spacer from '../../../shared/Spacer/index.lite';
import EditDirectory from '../EditDirectory/index.lite';
import DirectoryList from '../DirectoryList/index.lite';
import Card from '../../../shared/Card/index.lite';
import Button from '../../../shared/Button/index.lite';
import styles from './index.module.css';

const DEFAULT_VALUES = {
  directoryListData: [] as Directory[],
  view: 'LIST' as 'LIST' | 'EDIT' | 'CREATE',
  directoryToEdit: {} as Directory,
};

export default function DirectoriesWrapper(props: DirectoriesWrapperProps) {
  const state = useStore({
    directories: DEFAULT_VALUES.directoryListData,
    view: DEFAULT_VALUES.view,
    handleListFetchComplete: (directoryList: Directory[]) => {
      state.directories = directoryList;
    },
    get directoriesAdded(): boolean {
      return state.directories.length > 0;
    },
    get dsyncEnabled(): boolean {
      return state.directoriesAdded && state.directories.some((directory) => directory.deactivated === false);
    },
    directoryToEdit: DEFAULT_VALUES.directoryToEdit,
    switchToCreateView() {
      state.view = 'CREATE';
    },
    switchToEditView(action: 'edit' | 'view', directory: any) {
      state.view = 'EDIT';
      state.directoryToEdit = directory;
    },
    switchToListView() {
      state.view = 'LIST';
    },
    createSuccessCallback(info: { operation: 'CREATE'; connection?: Directory | undefined }) {
      props.componentProps.createDirectory.successCallback?.(info);
      state.switchToListView();
    },
    updateSuccessCallback(info: { operation: 'UPDATE' | 'DELETE'; connection?: Directory | undefined }) {
      // TODO handle oidc updation
      props.componentProps.editDirectory.successCallback?.(info);
      state.switchToListView();
    },
  });

  return (
    <div>
      <div class={styles.listview}>
        <Show when={state.view === 'LIST'}>
          <Show when={state.directoriesAdded}>
            <Card
              title={state.dsyncEnabled ? 'Directory Sync enabled' : 'Directory Sync disabled'}
              variant={state.dsyncEnabled ? 'success' : 'info'}>
              <div class={styles.ctoa}>
                <Button name='Add Connection' handleClick={state.switchToCreateView} />
              </div>
            </Card>
            <Spacer y={4} />
          </Show>
          <Spacer y={4} />
          <DirectoryList
            {...props.componentProps.directoryList}
            handleActionClick={state.switchToEditView}
            handleListFetchComplete={state.handleListFetchComplete}>
            <Card variant='info' title='Directories not enabled'>
              <Button name='Add Connection' handleClick={state.switchToCreateView} />
            </Card>
          </DirectoryList>
        </Show>
      </div>
      <Show when={state.view === 'EDIT'}>
        <EditDirectory
          {...props.componentProps.editDirectory}
          successCallback={state.updateSuccessCallback}
          errorCallback={props.componentProps.editDirectory.errorCallback}
          urls={{
            patch: `${props.componentProps.editDirectory.urls?.patch}/${state.directoryToEdit.id}` || '',
            delete: `${props.componentProps.editDirectory.urls?.delete}/${state.directoryToEdit.id}` || '',
            get: `${props.componentProps.editDirectory.urls?.get}/${state.directoryToEdit.id}` || '',
          }}
        />
      </Show>
      <Show when={state.view === 'CREATE'}>
        <Spacer y={5} />
        <CreateDirectory
          {...props.componentProps.createDirectory}
          successCallback={state.createSuccessCallback}
          errorCallback={props.componentProps.createDirectory.errorCallback}
          urls={{
            post: props.componentProps.createDirectory.urls?.post || '',
          }}
        />
      </Show>
    </div>
  );
}
