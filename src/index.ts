import {
  commitTransaction,
  parseRdf,
  startTransaction,
  toSparqlUpdate,
  transactionChanges
} from "@ldo/ldo";
import { FoafProfileShapeType } from "./.ldo/foafProfile.shapeTypes";

async function main() {
  const rawTurtle = `
    <Person1> a <http://xmlns.com/foaf/0.1/Person>;
      <http://xmlns.com/foaf/0.1/name> "Aang";
      <http://xmlns.com/foaf/0.1/knows> <Person2>.
    <Person2> a <http://xmlns.com/foaf/0.1/Person>;
      <http://xmlns.com/foaf/0.1/name> "Katara";
      <http://xmlns.com/foaf/0.1/knows> <Person1>.

  `;
  const ldoDataset = await parseRdf(
    rawTurtle,
    { baseIRI: "http://example.com/" }
  );
  const profile = ldoDataset
    .usingType(FoafProfileShapeType)
    .fromSubject("http://example.com/Person1");

  // Logs "Aang"
  console.log(profile.name);
  // Logs "Person"
  console.log(profile.type["@id"]);
  // Logs 1
  console.log(profile.knows?.length);
  // Logs "Katara"
  console.log(profile.knows?.[0].name);
  profile.name = "Bonzu Pippinpaddleopsicopolis III"
  // Logs "Bonzu Pippinpaddleopsicopolis III"
  console.log(profile.name);
  profile.knows?.push({
    type: { "@id": "Person" },
    name: "Sokka"
  });
  // Logs 2
  console.log(profile.knows?.length);
  // Logs "Katara" and "Sokka"
  profile.knows?.forEach((person) => console.log(person.name));

  startTransaction(profile);
  profile.name = "Kuzon"
  const changes = transactionChanges(profile);
  // Logs: <http://example.com/aang> <http://xmlns.com/foaf/0.1/name> "Kuzon"
  console.log(changes.added?.toString())
  // Logs: <http://example.com/aang> <http://xmlns.com/foaf/0.1/name> "Aang"
  console.log(changes.removed?.toString())
  console.log(await toSparqlUpdate(profile));
  commitTransaction(profile);
}

main();
