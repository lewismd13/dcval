import { mallPrice, print, visitUrl } from "kolmafia";
import { getPlayerFromIdOrName } from "libram";

function formatNumber(num: number) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export function main(arg: string): void {
  const player = getPlayerFromIdOrName(arg).id;
  const page = visitUrl(`displaycollection.php?who=${player}`);
  const dcDatabase = new Map();
  const dcCheck = /(?:<td valign=center><b>(.*?)<\/td><\/tr>)/gm;
  let items;
  while ((items = dcCheck.exec(page)) !== null) {
    if (!items[1].includes("(")) {
      const cleanItem = items[1].slice(0, items[1].indexOf(`</b>`));
      if (!Item.get(cleanItem).tradeable) {
        print(`${cleanItem} is untradeable`);
      } else {
        // print(`${cleanItem}`);
        const value = mallPrice(Item.get(cleanItem));
        dcDatabase.set(cleanItem, [1, value, value]);
      }
    } else {
      // figure out how to deal with names with parentheses - this breaks currently
      const name = items[1].slice(0, items[1].indexOf("> (") - 3);
      // print(`${name}`);
      if (!Item.get(name).tradeable) {
        print(`${name} is untradeable`);
      } else {
        const q = items[1].slice(items[1].indexOf("(") + 1, items[1].indexOf(")"));
        const quantity = q.replace(/,/g, "");
        // print(`${quantity.replace(/,/g, "")}`);
        if (parseInt(quantity)) {
          const value = mallPrice(Item.get(name));
          //  print(`${parseInt(quantity.replace(/,/g, ""))}`);
          // print(`${name} is worth ${value}`);
          const totalValue = parseInt(quantity) * value;
          dcDatabase.set(Item.get(name), [parseInt(quantity), value, totalValue]);
        } else {
          // figure out how to deal with names with parentheses
          print(`stupid things ${items[1]}`);
        }
      }
    }
  }
  let totalValue = 0;

  // now we sort the map by value
  const sortedDatabase = new Map([...dcDatabase.entries()].sort((a, b) => a[1][2] - b[1][2]));

  for (const shiny of sortedDatabase.keys()) {
    // print(`Item: ${shiny}`);
    // print(`Quantity: ${dcDatabase.get(shiny)[0]}`);
    const v = parseInt(sortedDatabase.get(shiny)[1]);
    const q = parseInt(sortedDatabase.get(shiny)[0]);
    const value = sortedDatabase.get(shiny)[2];
    // print(`Total Value: ${formatNumber(value)}`);
    totalValue += value;
    print(`${formatNumber(q)} ${shiny} @ ${formatNumber(v)} = ${formatNumber(value)}`);
  }
  print(
    `That is a total value of ${formatNumber(totalValue)} meat in ${
      getPlayerFromIdOrName(arg).name
    }'s DC`
  );
  // const saved = JSON.stringify(dcDatabase);
  // bufferToFile(saved, "dbvalue.txt");
}
