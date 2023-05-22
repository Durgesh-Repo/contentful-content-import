import * as fs from 'fs';

const contentfulSpaceId = process.env.CONTENTFUL_SPACE_ID;
const contentfulAccessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

const createPLPs = async (environment) => {
  
    const rawData = fs.readFileSync('imports/plp-content.json');
    const rows = JSON.parse(rawData);
    console.log('rows count: ', rows.length);
    for (const row of rows) {
      const url = row.URL.replace('https://www.marksandspencer.com', '');
      console.log('url: ', url);
      const ids = url.split('/');
      if (!cats.includes(ids[2])) {
        continue;
      }
      if (!categories.includes(ids[2])) {
        if (ids[1] === 'l') {
          categories.push(ids[2]);
        }
      }
      const stripeNo = stripes[ids[2]] ?? 'stripe1';
      const stripeId = stripeIds[stripeNo];
      // console.log(
      //   `category: ${ids[2]}, stripeNo: ${stripeNo}, stripeId: ${stripeId}`
      // );
  
      const existingPLP = PLPs.entries.find((p) => p.url === url);
      if (existingPLP) {
        // update
        await getEntry(environment, existingPLP.id).then(async (plpEntry) => {
          if (
            plpEntry.fields.heading['en-GB'] !== row.H1 ||
            plpEntry.fields.description['en-GB'] !== row.Description
          ) {
            plpEntry.fields.heading['en-GB'] = row.H1;
            plpEntry.fields.description['en-GB'] = row.Description;
            await plpEntry.update().then((plpE) => {
              console.log(`PLP updated: ${plpE.fields.name['en-GB']}`);
              console.log('update finish: ', Date.now());
              logger.log(`PLP updated after: ${plpE.fields.name['en-GB']}`);
              entries.push({
                id: plpE.sys.id,
                url: url,
                title: plpE.fields.name['en-GB'],
              });
            });
          }
        });
      } else {
        // console.log('cat: ', ids[2]);
        await createEntry(environment, 'productListingPage', {
          fields: {
            name: {
              'en-GB': `[PLP] ${row.H1}`,
            },
            slug: {
              'en-GB': url,
            },
            heading: {
              'en-GB': row.H1,
            },
            description: {
              'en-GB': row.Description,
            },
            siteStripe: {
              'en-GB': {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: stripeId,
                },
              },
            },
          },
        }).then((plpEntry) => {
          console.log(`PLP created: ${plpEntry.fields.name['en-GB']}`);
          logger.log(`PLP created: ${plpEntry.fields.name['en-GB']}`);
          entries.push({
            id: plpEntry.sys.id,
            url: url,
            title: plpEntry.fields.name['en-GB'],
          });
        }).catch(logger.log);
      }
    }
    const date = new Date();
    writeJsonToFile(
      `migrations/plp-${date
        .toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '')}.json`,
      { entries }
    );
    console.log('cagegories: ', categories);
  };