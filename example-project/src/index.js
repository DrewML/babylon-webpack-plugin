console.log('wat');

import(/* webpackChunkName: "templates" */ './a').then(mod => {
    console.log(mod);
});
