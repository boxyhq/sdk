import { useStore } from '@builder.io/mitosis';

export interface ButtonBaseProps {
  Icon?: any;
  loading?: any;
  children?: any;
  buttonName?: string;
  color?: string;
}

export default function ButtonBase(props: ButtonBaseProps) {
  const state = useStore({
    get classNames() {
      return `btn h-4 w-4 ${props.children ? 'mr-1' : ''} ${props.color}`;
    },
  });

  return (
    <button className={state.classNames}>
      {props.Icon}
      {props.buttonName}
      {props.children}
    </button>
  );
}
