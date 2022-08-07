import { render } from 'solid-js/web';

function HelloWorld() {
    return <div class="red"></div>;
}

render(() => <HelloWorld />, document.getElementById('app') as HTMLElement);