const path = require('path');
const fs = require('fs-extra');
const { FSUtil } = require('zigmium/util/fs-util.js');

exports.finalize = async pages => {
  try {
    await fs.remove(path.join(process.env.PROJECT_ROOT, '/public'));
  } catch (error) {
    console.log('No public folder.');
  }
  try {
    await fs.copy(
      path.join(process.env.PROJECT_ROOT, '/static'),
      path.join(process.env.PROJECT_ROOT, '/public'),
    );
  } catch (error) {
    console.log('No static folder.');
  }
  for (const i in pages) {
    const page = pages[i];
    await FSUtil.save(page.html.src, `/public/${page.location.path}`);
  }
};
