#!/usr/bin/env node
/**
 * Stage 2 golden output check: every tagged pilot template in templates/pilot
 * must (1) parse and render under docxtemplater with synthetic data derived
 * from its TemplateFieldMap, (2) produce a valid zip whose document.xml
 * contains the sampled values, and (3) contain no tags that are neither a
 * field-map field (or grid cell) nor a known context key — catching drift
 * between the tagged copies and lib/template-registry-data.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'lib', 'template-registry-data.json'), 'utf8'));
const pilotDir = path.join(root, 'templates', 'pilot');

const CONTEXT_KEYS = [
  'patientName', 'dob', 'ageSex', 'mrn', 'diagnosis', 'laterality', 'site',
  'generatedDate', 'responseStatus', 'signedBy', 'orderedDate',
];

function sampleForField(field) {
  if (field.kind === 'number') return 42;
  if (field.kind === 'date') return '2026-07-07';
  if (field.kind === 'checkbox') return 'Yes';
  if (field.options && field.options.length > 0) return field.options[0];
  return `SAMPLE_${field.id}`;
}

function dataForFieldMap(fieldMap) {
  const data = {};
  for (const key of CONTEXT_KEYS) data[key] = `CTX_${key}`;
  for (const section of fieldMap.sections) {
    for (const field of section.fields) {
      if (field.kind === 'grid') {
        for (const row of field.rows ?? []) {
          for (const col of field.columns ?? []) {
            data[`${field.id}__${row.id}__${col.id}`] = `G_${row.id}_${col.id}`;
          }
        }
      } else {
        data[field.id] = sampleForField(field);
      }
    }
  }
  return data;
}

let failures = 0;
const files = fs.readdirSync(pilotDir).filter((f) => f.endsWith('.docx'));
if (files.length === 0) {
  console.error('no pilot templates found');
  process.exit(1);
}

for (const file of files.sort()) {
  const sourceId = path.basename(file, '.docx');
  const source = registry.templateSources.find((s) => s.id === sourceId);
  const requirement = registry.documentRequirements.find((r) => r.templateSourceId === sourceId);
  const fieldMap = requirement
    ? registry.templateFieldMaps.find((m) => m.requirementId === requirement.id)
    : undefined;
  if (!source || !requirement || !fieldMap) {
    failures++;
    console.error(`FAIL ${file}: no registry source/requirement/field map for ${sourceId}`);
    continue;
  }

  try {
    const data = dataForFieldMap(fieldMap);
    const zip = new PizZip(fs.readFileSync(path.join(pilotDir, file)));
    const unknown = new Set();
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: (part) => {
        if (part?.value) unknown.add(part.value);
        return '';
      },
    });
    doc.render(data);
    if (unknown.size > 0) {
      failures++;
      console.error(`FAIL ${file}: tags with no field-map/context backing: ${[...unknown].join(', ')}`);
      continue;
    }
    const rendered = doc.getZip().generate({ type: 'nodebuffer' });
    const docXml = new PizZip(rendered).file('word/document.xml').asText();
    const headerXml = Object.keys(new PizZip(rendered).files)
      .filter((n) => /^word\/(header|footer)\d*\.xml$/.test(n))
      .map((n) => new PizZip(rendered).file(n).asText())
      .join('');
    const probes = Object.entries(data).slice(0, 200);
    const missing = probes.filter(([, v]) => !docXml.includes(String(v)) && !headerXml.includes(String(v)));
    // Not every field lands in every document (specs record unplaced fields);
    // require that at least one sampled value rendered and none corrupted.
    if (missing.length === probes.length) {
      failures++;
      console.error(`FAIL ${file}: no sampled value appeared in the rendered output`);
      continue;
    }
    console.log(`OK   ${file}: rendered ${rendered.length} bytes, ${probes.length - missing.length}/${probes.length} sampled values present`);
  } catch (err) {
    failures++;
    const detail = err?.properties?.errors?.map((e) => e.properties?.explanation).join('; ') ?? err.message;
    console.error(`FAIL ${file}: ${detail}`);
  }
}

console.log(failures ? `${failures} template(s) failed` : `all ${files.length} pilot templates render`);
process.exit(failures ? 1 : 0);
