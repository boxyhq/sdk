import { ButtonProps } from '../types';

export default function ButtonDanger(props: ButtonProps) {
  return (
    <button type='button' class={props.classNames} color={props.color} onClick={() => props.onClick()}>
      {props.children}
    </button>
  );
}
