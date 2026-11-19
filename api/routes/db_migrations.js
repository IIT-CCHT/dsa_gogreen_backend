const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ModelByEntity } = require('../utils/evals')
const migrationData = require('../../migrations/index.json')
const path = require('path');
const fs = require('fs')
const crypto = require('crypto');



const functions = {
  migrateToVersion_1,
  migrateToVersion_2,
  migrateToVersion_3,
  migrateToVersion_4,
  migrateToVersion_5,
  migrateToVersion_6,
  migrateToVersion_7,
  migrateToVersion_8,
  migrateToVersion_9,
  migrateToVersion_10,
  migrateToVersion_11,
  migrateToVersion_12,
  migrateToVersion_13,
  migrateToVersion_14,
  migrateToVersion_15,
  migrateToVersion_16,
  migrateToVersion_17,
  migrateToVersion_18,
  migrateToVersion_19,
  migrateToVersion_20,
  migrateToVersion_21,
  migrateToVersion_22,
  migrateToVersion_23,
  migrateToVersion_24,
  migrateToVersion_25,
  migrateToVersion_26,
  migrateToVersion_27,
  migrateToVersion_28,
  migrateToVersion_29,
  migrateToVersion_30,
  migrateToVersion_31,
  migrateToVersion_32,
  migrateToVersion_33,
  migrateToVersion_34,
  migrateToVersion_35,
  migrateToVersion_36,
  migrateToVersion_37,
  migrateToVersion_38,
  migrateToVersion_39,
}

router.get('/', async (req, res) => {
  try 
  {
    console.log('START MIGRATION')
    let dbVersionObj = 
        await ModelByEntity("settings")
          .findOne({name: "db_version"})
          .select("name version")
          .exec();

    // await mongoose.connection.db.collection('settings').find().toArray()
    //dbVersionObj = dbVersionObj.length > 0 ? dbVersionObj[0] : {}

    console.log('dbVersionObj', dbVersionObj)
    let { version: dbVersion } = dbVersionObj || {}
    dbVersion = dbVersion === undefined || dbVersion === null ? 0 : parseInt(dbVersion)
    let message = "Nulla da migrare"
    let new_version = dbVersion+1
    console.log('new_version', new_version)
    const functionName = `migrateToVersion_${new_version}`
    if (functions[functionName]) {
        console.log('Function exists')
        await functions[functionName](); // Chiama la funzione se esiste
        console.log('Update version')
        dbVersionObj.version = new_version
        console.log('Version updated')
        await mongoose.model('settings').findOneAndUpdate({_id:dbVersionObj._id}, dbVersionObj);
        message = `Migrazione alla versione ${new_version} attuata con successo` 
    }  

    res.status(200).json({
      message
    })
  } catch(e)
  {
    console.log(`### MIGRATION ERROR: ${e}`)
  }
})

async function updateTesters()
{
  let count = 0
  for(const tester of testers_2)
  {
    if(!(emailIsvalid(tester.email)))
    {
      console.log({ message: "Email is not valid: "+tester.email})
    } else 
    {
      count += 1
      await registerUser(tester.name, tester.email, tester.password, count)
    }
  }
}

async function migrateToVersion_39()
{
  await mongoose.connection.db.collection('materials').updateOne({name:"Triton X"}, {$set: {type: "detergents"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Synperonic A7"}, {$set: {type: "detergents"}})

  await mongoose.connection.db.collection('materials').updateOne({name:"Epoxy Resin, 2-Component: Comprehensive"}, {$set: {type: "resins"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Paraloid B-72"}, {$set: {type: "resins"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Aldehyde Resin: Comprehensive/Laropal A-81"}, {$set: {type: "resins"}})

  await mongoose.connection.db.collection('materials').updateOne({name:"Klucel G, M"}, {$set: {type: "thickeners"}})

  await mongoose.connection.db.collection('materials').updateOne({name:"Acetone"}, {$set: {type: "solvents"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Ethanol"}, {$set: {type: "solvents"}})

  await mongoose.connection.db.collection('materials').updateOne({name:"Water Deionized"}, {$set: {type: "waters"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Water Distilled"}, {$set: {type: "waters"}})
}

async function migrateToVersion_38()
{
  await updateTesters()
}


async function migrateToVersion_37()
{
  await mongoose.connection.db.collection('materials').updateOne({name:"Triton X"}, {$set: {hazard_assessments: {G1: '',G2: ''}}})
}

async function migrateToVersion_36()
{
  await updateTesters()
}

async function migrateToVersion_35()
{
  await mongoose.connection.db.collection('materials').updateMany(
      { hazard_assessments: { $exists: false } }, // seleziona documenti senza hazard_assessments
      { $set: { hazard_assessments: { G1: 0, G2: 0 } } } // imposta i valori
    );
}

async function migrateToVersion_34()
{
  await mongoose.connection.db.collection('materials').updateOne({name:"Paraloid B72"}, {$set: {hazard_assessments: {G1: 0,G2: 0}}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Klucel G, M"}, {$set: {hazard_assessments: {G1: '',G2: ''}}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Synperonic A7"}, {$set: {hazard_assessments: {G1: '',G2: ''}}})

}




async function migrateToVersion_33()
{
  await updateTesters()
}


async function migrateToVersion_32()
{
  await mongoose.connection.db.collection('materials').updateOne({name:"Paraloid B72"}, {$set: {hazard_assessments: {G1: 0,G2: 0}}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Klucel G, M"}, {$set: {hazard_assessments: {G1: '',G2: ''}}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Synperonic A7"}, {$set: {hazard_assessments: {G1: '',G2: ''}}})

}


async function migrateToVersion_31()
{
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G1'}, { $set: { name:'Toxicity and hazard metrics for the natural environment'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G2'}, { $set: { name:'Toxicity and hazard metrics for humans'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G3'}, { $set: { name:'Energy - Indoor climate control impacts'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G4'}, { $set: { name:'Energy - Consumption in approach / application'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G5'}, { $set: { name:'Energy - Conservation approach / treatment-associated materials / products to be used'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G6'}, { $set: { name:'Availability - Water & resource use'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G7'}, { $set: { name:'Availability - Biodiversity impacts'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G8'}, { $set: { name:'Waste'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G9'}, { $set: { name:'Material / Product selection and application method'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G10'}, { $set: { name:'Efficiency - Number of applications / consumption / quantities of materials / products used'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G11'}, { $set: { name:'Longevity of result'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G12'}, { $set: { name:'Accessibility - Availability of approach / used materials / products'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G13'}, { $set: { name:'Accessibility - Ease of use and time'}}, {new: true, upsert: true})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G14'}, { $set: { name:'Quality / value impacts of result in meeting preservation goals'}}, {new: true, upsert: true})
}

async function migrateToVersion_30()
{
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G1' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G2' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G3' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G4' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G5' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G6' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G7' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G8' }, {$set: { show: true, active: false } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G9' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G10' }, {$set: { show: true, active: false } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G11' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G12' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G13' }, {$set: { show: true, active: true } })
  await mongoose.connection.db.collection('green_parameters').updateOne({ code:'G14' }, {$set: { show: true, active: true } })
}

async function migrateToVersion_29()
{
  await mongoose.connection.db.collection('useful_links').deleteMany({});

  await mongoose.connection.db.collection('useful_links').insertMany([
    {_id:new mongoose.Types.ObjectId(),order:1,relevant:true,topic:'Sustainable development goals; energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; preventive; interventive',medium_type:'Tool; toolkit; training programme; forum; case studies',access:'Paid; registration required',name:'Ki Futures / Ki Port',description:'Ki Futures is an international coaching and training network. The comprehensive program provides everything that an institution needs to become sustainable, from tools and guides to training and mentoring, as well as connecting to local and global networks of sustainability leaders. The Ki Port is a customised online platform that powers Ki Futures. Here, Champions and Coaches can connect, share successes, and get inspired by sustainability pioneers around the world. The Ki Port houses all Ki Futures guides, resources, and recorded trainings, as well as a database of user-generated Ki Reports (case studies).',link:'https://www.kiculture.org/ki-futures/',owner:'Ki Culture'},
    {_id:new mongoose.Types.ObjectId(),order:2,relevant:true,topic:'materials; LCA; carbon calulator; interventive; preventive;',medium_type:'Case studies; toolkit; tool',access:'Free',name:'Sustainability Tools in Cultural Heritage (STiCH)',description:'STiCH is a life cycle assessment (LCA) Carbon Calculator and Library of Case Studies and Information Sheets developed to help cultural heritage professionals make educated, sustainable choices to lower the environmental impact of their work.',link:'https://stich.culturalheritage.org/',owner:'Contributions by FAIC, Pratt, Northeastern U. Carbon calculator used database ecoinvent 3.6, a commercial database of environmental data for thousands of products and processes, published in Switzerland (https://ecoinvent.org/).'},
    {_id:new mongoose.Types.ObjectId(),order:3,relevant:true,topic:'Sustainable development goals; preventive; interventive',medium_type:'Toolkit; case studies; literature; webinars; self-assessment tool',access:'Free',name:'Our Collections Matter / OCM Toolkit',description:'Platform that offers resources to implement sustainable development related to SDGs through the 3T strategy: tools (provide toolkits, concretely address SDG targets, measure and report progress), training (use toolkit, connect conservation and collections and sustainable development, empower) and transformation (communities, mindsets, behaviour). Introduction: https://www.iccrom.org/programmes/our-collections-matter',link:'https://ocm.iccrom.org/#',owner:'International Centre for the Study of the Preservation and Restoration of Cultural Property (ICCROM)'},
    {_id:new mongoose.Types.ObjectId(),order:4,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Tool; toolkit; training platform; case studies; carbon calculator; blog',access:'Free; registration required',name:'Gallery Climate Coalition / GCC Carbon Calculator',description:'GCC is an international membership organisation providing environmental sustainability guidelines for the art sector, including various toolkits and a carbon calculator. GCC has identified three primary sources of carbon emissions common to galleries, institutions, artist studios, and businesses in the art sector: travel, shipping and building energy consumption. These are key data points that we encourage users to prioritise when creating a carbon report. The calculator also provides additional data categories to give users a full picture of their emissions across categories including surface travel, accommodation, materials and digital. Users are given a full breakdown of their carbon emissions, with visuals, at the end of the report to reflect on and proactively make changes within their organisations. Completing an annual carbon report will allow users to gain a GCC active membership status. You can learn more about active membership here.collection of links to useful databases and websites related to artists (and some conservation related) materials',link:'https://galleryclimatecoalition.org/',owner:'Gallery Climat Coalition'},
    {_id:new mongoose.Types.ObjectId(),order:5,relevant:true,topic:'Energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; interventive; preventive',medium_type:'Case studies; wikipedia; podcast; webinars; literature; newsletter',access:'Free',name:'AIC Sustainable Practices Wiki',description:'Sustainability wiki for conservators maintained by members of the American Institute for Conservation\'s Sustainability Committee. Resources include: newsletter, podcasts, webinars, introductions to sustainability, specific materials, sustainable engergy use, case studies etc.',link:'https://www.conservation-wiki.com/wiki/Sustainable_Practices',owner:'American Institute for Conservation\'s Sustainability Committee'},
    {_id:new mongoose.Types.ObjectId(),order:6,relevant:true,topic:'Energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; interventive; preventive',medium_type:'Case studies; literature; webinars; podcasts; tools',access:'Free; registration required',name:'ICON Sustainability Group',description:'A cross-disciplinary group to encourage the take up of positive environmental practices in cultural heritage. A practical Group providing solutions, case studies on good environmental practice, crowdsourcing of ideas to solve those knotty environmental questions, \'how to\' advice, and a way to share and recycle materials and equipment.',link:'https://www.icon.org.uk/groups-and-networks/sustainability-group.html',owner:'The Insitute of Conservation'},
    {_id:new mongoose.Types.ObjectId(),order:7,relevant:true,topic:'Energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; interventive; preventive',medium_type:'Training programme',access:'Free; registration required',name:'IIC Net Zero Programme',description:'IIC Net Zero aligns to the United Nations Framework Convention on Climate Change (UNFCCC): Race to Zero Partnership Campaign. As 2023 and 2024 set to become the warmest years on record, and as the UN warns the world is heading for 3°C of climate warming, our sector must set a credible path to cutting carbon emissions. Driven by the Joint Commitment for Climate Action in Cultural Heritage Conservation between IIC, ICCROM and ICOM-CC, this programme will support professionals in small and large institutions as well as freelancers to build momentum to meet the goals of the 1.5°C threshold set by the Paris Agreement and help accelerate the transition to a net zero sector. It aims for the conservation field to show leadership by committing to the Net Zero pledge, setting science-based targets, taking action and reporting on the positive changes achieved.',link:'https://www.iiconservation.org/iic-net-zero-project',owner:'International Institute for conservation of historic and artistic works'},
    {_id:new mongoose.Types.ObjectId(),order:8,relevant:true,topic:'preventive; interventive',medium_type:'Podcast',access:'Free',name:'Green Tea Podcast',description:'A podcast about cultural heritage preservation and sustainability. Green Tea seeks to engage its listeners with contemporary topics about cultural heritage and sustainability. Hosted by the American Institute for Conservation\'s Sustainability Committee, we speak with experts and changemakers as they share success stories, big ideas, and inspiration for change to combat the climate crisis and its effects. From individuals to large institutions, we can all make a positive impact for our collections, our people, our heritage and our planet.',link:'https://open.spotify.com/show/3b5jkqeiZEVasHKHZNlMf1',owner:'AIC Sustainability Committee'},
    {_id:new mongoose.Types.ObjectId(),order:9,relevant:true,topic:'preventive; interventive',medium_type:'Literature; webinars; podcasts',access:'Free',name:'GoGreen - Bibliography',description:'A list of resources compiled by SiC and in the process of defining green conservation in the GoGreen EU Horizon project.',owner:'GoGreen EU Horizon'},
    {_id:new mongoose.Types.ObjectId(),order:10,relevant:true,topic:'Risk assessment; preventive',medium_type:'Tool',access:'Free; registration required',name:'HERIe',description:'Digital decision-supporting platform providing remote access to data manipulation tools and to quantitative assessment of risks to heritage assets. The platform is organised in the framework of ten independent modules corresponding to ten agents of deterioration. Ten deterioration agents: RH/T/criminal acts/pests/contaminants/light radiation/water/physical forces/neglect. Various tools actually combined: mechanical damage functions due to environmental fluctuations for restrained wood, panel paintings, parchment; chemical degradation; fire risk; contaminants (indoor concentration gas pollutants); light damage calculator. This review focussed on mechanical damage tool since this is specified in GoGreen project as parameter.',link:'https://herie.pl/',owner:'Jerzy Haber Institute of Catalysis and Surface Chemistry, Polish Academy of Sciences (ICSC PAS)'},
    {_id:new mongoose.Types.ObjectId(),order:11,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Tool; training platform;',access:'Free',name:'Greener Solvent database',description:'Comparative database for solvents with chemical and physical data, safety data (includes CHEM21, hazards and occupational exposures)',link:'https://siconserve.wpengine.com/greener-solvents/greener-solvents-research-platform/',owner:'Hosted by Sustainability in Conservation project partner the University of Delaware'},
    {_id:new mongoose.Types.ObjectId(),order:12,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Reference database',access:'Free',name:'ECHA CHEM (REACH)',description:'ECHA CHEM is the European Chemicals Agency\'s (ECHA) public chemicals database. It is designed to publish and share information on chemicals. The first release of ECHA CHEM includes data from over 100,000 REACH registrations (Registration, Evaluation, Authorisation and Restriction of Chemicals).',link:'https://echa.europa.eu/substance-information',owner:'European Chemicals Agency'},
    {_id:new mongoose.Types.ObjectId(),order:13,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Reference database',access:'Free',name:'PubChem',description:'PubChem is the world\'s largest collection of freely accessible chemical information',link:'https://pubchem.ncbi.nlm.nih.gov/ National Library of Medicine',owner:'National Institutes of Health (NIH)'},
    {_id:new mongoose.Types.ObjectId(),order:14,relevant:true,topic:'Solvents; risk assessment; interventive',medium_type:'Solvents; risk assessment in conservation; interventive',access:'Free',name:'Fife Solvent Star',description:'visual documentation of solvent tests for coatings removal from paintings',link:'https://sral.nl/download_file/ce84118b-35af-41d6-a3ed-385080557d34/9',owner:'Fife/SRAL'},
    {_id:new mongoose.Types.ObjectId(),order:15,relevant:true,topic:'Solvent assessment; interventive',medium_type:'Reference database',access:'Free',name:'CHEM21',description:'Prat et al. published CHEM21 selection guide based on health, safety, and environmental criteria, which includes not only classical solvents, but also emerging solvents, such as bio-derived solvents. Solvents are defined as: Recommended: solvents to be tested first in a screening exercise, if of course there is no chemical incompatibility in the process conditions. Problematic: these solvents can be used in the lab, but their implementation in the pilot plant or at the production scale will require specific measures, or significant energy consumption Hazardous: the constraints on scale-up are very strong. The substitution of these solvents during process development is a priority Highly Hazardous: solvents to be avoided, even in the laboratory',link:''},
    {_id:new mongoose.Types.ObjectId(),order:16,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Tool',access:'Registration required',name:'Intermatter',description:'Impact tool calculator for interior design. The Inter Matter team developed the classification tool based on science and open-source data from the Idemat platform that is developed by TU-Delft. The tool generates an assessment based on 20% of the life cycle of a material that generates 80% impact.',link:'https://www.intermatter.nl/',owner:'Intermatter'},
    {_id:new mongoose.Types.ObjectId(),order:17,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Reference database',access:'Free',name:'CompTox Chemcals Dashboard',description:'The CompTox Chemicals Dashboard provides public access to chemical data. It is a widely used resource for chemistry, toxicity, and exposure information for over a million chemicals. The available data includes, but is not limited to, chemical properties, environmental fate and transport, hazard (e.g., point of departure, legacy toxicity values, screening levels, exposure limits), in vitro to in vivo extrapolation (IVIVE), exposure (e.g., predictions associated with the ExpoCast effort, use categories, toxic release inventory, monitoring data), bioactivity (e.g., high-throughput data from ToxCast and Tox21 efforts). In addition, the Dashboard provides information on similar chemicals and related substances, chemical lists, links out to other reputable resources, including Open Source widgets and tools.',link:'https://comptox.epa.gov/dashboard/',owner:'Environmental Protection Agency (EPA)'},
    {_id:new mongoose.Types.ObjectId(),order:18,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Reference database',access:'Free',name:'Ecological Structure Activity Relationships (ECOSAR)',description:'The ECOSAR Class Program is a computerized predictive system that estimates aquatic toxicity. The program estimates a chemical\'s acute (short-term) toxicity and chronic (long-term or delayed) toxicity to aquatic organisms, such as fish, aquatic invertebrates, and aquatic plants, by using computerized Structure Activity Relationships (SARs).',link:'https://www.epa.gov/tsca-screening-tools/ecological-structure-activity-relationships-ecosar-predictive-model',owner:'U.S. Environmental Protection Agency'},
    {_id:new mongoose.Types.ObjectId(),order:19,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Tool',name:'GSCE Compass Rose',description:'Chemistry education (visual tool)'},
    {_id:new mongoose.Types.ObjectId(),order:20,relevant:true,topic:'Solvents; interventive',medium_type:'Tool',access:'Free',name:'ACS solvent selection tool',description:'This tool allows you interactively select solvents based upon the Principal Component Analysis (PCA) of the solvent\'s physical properties. Solvents which are close to each other in the map have similar physical and chemical properties, whereas distance solvents are significantly different. In addition to the PCA scores other data including the physical properties, functional groups and environmental data has been included to aid in the rational selection of solvents.',link:'https://www.acs.org/greenchemistry/research-innovation/tools-for-green-chemistry/solvent-tool.html',owner:'American chemical society'},
    {_id:new mongoose.Types.ObjectId(),order:21,relevant:true,topic:'Solvent information database; materials; interventive',medium_type:'Tool',access:'Free',name:'Green solvent selection tool',description:'The Solvent Ranking Table orders the solvents by their distance (Ra) to the solute in the Hansen space, i.e. by their similarity in solubility capacity. You can alternatively rank the solvents according to their composite sustainability score (G, a higher value represents a more sustainable alternative), boiling point (bp), viscosity (η), or surface tension (𝜎). By selecting a solvent in the Hansen space or the Solvent Ranking Table you get information regarding chemical structure, physical properties, and sustainability indicators.',link:'https://green-solvent-tool.herokuapp.com/',owner:'The Organic Photonics & Electronics Group; Umea University'},
    {_id:new mongoose.Types.ObjectId(),order:22,relevant:true,topic:'Greenhouse gas emissions; LCA; preventive; interventive',medium_type:'Tool; training platform;',name:'GHG emissions calculation tool',description:'GHG Protocol tools enable companies and cities to develop comprehensive and reliable inventories of their GHG emissions, and help countries and cities track progress toward their climate goals.',link:'https://ghgprotocol.org/calculation-tools'},
    {_id:new mongoose.Types.ObjectId(),order:23,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Case studies; training platform',access:'Free',name:'OpenLCA',description:'LCA case studies (mostly free)',link:'https://www.openlca.org/case-studies/',owner:'GreenDelta (Berlin)'},
    {_id:new mongoose.Types.ObjectId(),order:24,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Case studies; training platform',access:'Free',name:'NEXUS OPENLCA',description:'openLCA Nexus is an online repository for LCA data. It combines data offered by world-leading LCA data providers such as PE International (GaBi databases), the ecoinvent centre (ecoinvent), or the Joint Research Centre from the European Commission (ELCD).',link:'https://nexus.openlca.org/databases',owner:'GreenDelta (Berlin)'},
    {_id:new mongoose.Types.ObjectId(),order:25,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Tool; application',name:'Idemat',description:'Idemat is a sustainability inspired materials selection app, empowering designers to create more sustainable products. Idemat features two impact indicators to express environmental burden: eco-costs – developed by Delft University of Technology – and carbon footprint. Choosing either one allows for the selection of one of three scenarios, which are explained in detail in the app. What happens with a material near the end of its life can have a significant contribution regarding its environmental impact. By integrating these so called end-of-life scenarios at the start of the selection process, a complex and error prone step is greatly simplified.',link:'https://idematapp.com/',owner:'Idemat TU Delft'},
    {_id:new mongoose.Types.ObjectId(),order:26,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Tool;',access:'Paid; registration required',name:'ecoinvent',description:'LCA data',link:'https://ecoinvent.org/',owner:'ecoinvent'},
    {_id:new mongoose.Types.ObjectId(),order:27,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Tool;',access:'Free; registration required',name:'ecoQuery',description:'LCA data',link:'https://ecoquery.ecoinvent.org/3.10/cutoff/search'},
    {_id:new mongoose.Types.ObjectId(),order:28,relevant:true,topic:'preventive; interventive',medium_type:'Literature; webinars; podcasts',access:'Free',name:'Sustainability in Cultural Heritage Preservation & Conservation Resource Bank',description:'Bibliography by AIC Sustainability Committee',link:'https://www.zotero.org/aic-sustainability_committee',owner:'AIC Sustainability Committee'},
    {_id:new mongoose.Types.ObjectId(),order:29,relevant:true,topic:'preventive; interventive',medium_type:'Webinar',access:'Free',name:'Sustainable Packing, Moving and Storage',link:'https://www.youtube.com/playlist?list=PLH0WXCtI2noiOPBhGRj0rGNg4Hk3uiUfO',owner:'AIC'},
    {_id:new mongoose.Types.ObjectId(),order:30,relevant:true,topic:'interventive',medium_type:'Podcast',access:'Free',name:'Conservators combatting climate change',link:'https://www.youtube.com/playlist?list=PLH0WXCtI2nojnbAFGZb0cTl-jfhagcNKm',owner:'AIC'},
    {_id:new mongoose.Types.ObjectId(),order:31,relevant:true,topic:'interventive',medium_type:'Webinar',access:'Free',name:'Sustainable Practices in Heritage Conservation',link:'https://www.youtube.com/playlist?list=PLH0WXCtI2nojU-QsPpZleHjnqEdUExQLV',owner:'AIC'},
    {_id:new mongoose.Types.ObjectId(),order:32,relevant:true,topic:'energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; preventive; interventive',medium_type:'Tool; literature',access:'Free',name:'Environmental Protection Agency (United States)',description:'EAP has assembled more than 60 tools and resources to help participants, stakeholders, and assessment teams address various area of improvement.',link:'https://www.epa.gov/e3/e3-sustainability-tools',owner:'Environmental Protection Agency USA'}
  ]);
}

async function migrateToVersion_28()
{
  await ModelByEntity("materials").findOneAndUpdate({ name:'Cotton'}, { $set: { "lca_data.relative_density": 1 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Evolon'}, { $set: { "lca_data.relative_density": 1 } }, {new: true, upsert: false})
  
}

async function migrateToVersion_27()
{
  await ModelByEntity("materials").findOneAndUpdate({ name:'Acetone'}, { $set: { "lca_data.relative_density": 0.784 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Ethanol'}, { $set: { "lca_data.relative_density": 0.789 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Epoxy Resin, 2-Component: Comprehensive'}, { $set: { "lca_data.relative_density": 1.2 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Klucel G, M'}, { $set: { "lca_data.relative_density": 1 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Paraloid B-72'}, { $set: { "lca_data.relative_density": 1.15 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Synperonic A7'}, { $set: { "lca_data.relative_density": 0.958 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Triton X'}, { $set: { "lca_data.relative_density": 1.06 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Water Deionized'}, { $set: { "lca_data.relative_density": 1 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Water Distilled'}, { $set: { "lca_data.relative_density": 1 } }, {new: true, upsert: false})
  await ModelByEntity("materials").findOneAndUpdate({ name:'Aldehyde Resin: Comprehensive/Laropal A-81'}, { $set: { "lca_data.relative_density": 1.11 } }, {new: true, upsert: false})
}

async function migrateToVersion_26()
{
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G1'}, { $set: { name:'Toxicity and hazard metrics for the natural environment'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G2'}, { $set: { name:'Toxicity and hazard metrics for humans'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G3'}, { $set: { name:'Energy - Indoor climate control impacts'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G4'}, { $set: { name:'Energy - Consumption in approach / application'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G5'}, { $set: { name:'Energy - Conservation approach / treatment-associated materials / products to be used'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G6'}, { $set: { name:'Availability - Water & resource use'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G7'}, { $set: { name:'Availability - Biodiversity impacts'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G8'}, { $set: { name:'Waste'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G9'}, { $set: { name:'Material / Product selection and application method'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G10'}, { $set: { name:'Efficiency - Number of applications / consumption / quantities of materials / products used'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G11'}, { $set: { name:'Longevity of result'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G12'}, { $set: { name:'Accessibility - Availability of approach / used materials / products'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G13'}, { $set: { name:'Accessibility - Ease of use and time'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G14'}, { $set: { name:'Quality / value impacts of result in meeting preservation goals'}}, {new: true, upsert: false})
  //await ModelByEntity("green_parameter_groups").findOneAndUpdate({ slug:'art_work_specific'}, { $set: { name:'object, treatment specific/professional parameters'}}, {new: true, upsert: false})
}

async function migrateToVersion_25()
{
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G1'}, { $set: { name:'Toxicity and hazard metrics for the natural environment'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G2'}, { $set: { name:'Toxicity and hazard metrics for humans'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G3'}, { $set: { name:'Energy - Indoor climate control impacts'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G4'}, { $set: { name:'Energy - Consumption in approach / application'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G5'}, { $set: { name:'Energy - Conservation approach / treatment-associated materials / products to be used'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G6'}, { $set: { name:'Availability - Water & resource use'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G7'}, { $set: { name:'Availability - Biodiversity impacts'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G8'}, { $set: { name:'Waste'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G9'}, { $set: { name:'Material / Product selection and application method'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G10'}, { $set: { name:'Efficiency - Number of applications / consumption / quantities of materials / products used'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G11'}, { $set: { name:'Longevity of result'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G12'}, { $set: { name:'Accessibility - Availability of approach / used materials / products'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G13'}, { $set: { name:'Accessibility - Ease of use and time'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G14'}, { $set: { name:'Quality / value impacts of result in meeting preservation goals'}}, {new: true, upsert: false})
  //await ModelByEntity("green_parameter_groups").findOneAndUpdate({ slug:'art_work_specific'}, { $set: { name:'object, treatment specific/professional parameters'}}, {new: true, upsert: false})
}

async function migrateToVersion_24()
{
  await mongoose.connection.db
    .collection('materials')
    .updateOne(
      { name: "Epoxy Resin, 2-Component: Comprehensive" },
      { $set: { reference_unit: "gr" } }
  )

}

async function migrateToVersion_23()
{
  //await mongoose.connection.db.collection('useful_link').deleteOne({ name: "OpenLCA" })
  //await mongoose.connection.db.collection('useful_link').updateOne({ name: "OpenLCA" },{ $unset: { link: "https://nexus.openlca.org/" } })
}

async function migrateToVersion_22()
{
  await mongoose.connection.db
    .collection('materials')
    .updateOne(
      { name: "Paraloid B-72" },
      { $unset: { hazard_assessments: "" } }
  )
}

async function migrateToVersion_21()
{
  await mongoose.connection.db.collection('materials').updateMany(
    {}, // filtro vuoto = tutti i documenti
    { $set: { active: false } } // campo da aggiornare
  );
  await mongoose.connection.db.collection('materials').updateOne({name:"Water Distilled"}, {$set: {
    active: true,
    hazard_assessments: {G1: 0,G2: 0} 
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Cotton"}, {$set: {
    active: true,
    hazard_assessments: {G1: 0,G2: 0} 
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Evolon"}, {$set: {
    active: true,
    hazard_assessments: {G1: 0,G2: 0} 
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Paraloid B-72"}, {$set: {
    active: true,
    hazard_assessments: {G1: "?",G2: "?"},
    lca_data: {
      v_001:{
        G1: { value: 0.00000002581489731641220},
        G2: { value: 0.00001361736284410600000},
        G5: { value: 9.526 },
        G6: { value: 0.02641884768337230000000 },
        G7: { value: 0 },
      }
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Epoxy Resin, 2-Component: Comprehensive"}, {$set: {
    type:"substances",
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    },
    reference_amount: 1,
    lca_data: {
      v_001:{
        G1: { value: 0.00000002908365858778020 },
        G2: { value: 0.00001671896937317570000},
        G5: { value: 6.364 },
        G6: { value: 0.03391451416862180000000 },
        G7: { value: 0 },
      }
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Klucel G, M"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    },
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Synperonic A7"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Triton X"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Water Deionized"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: 0,
      G2: 0
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Aldehyde Resin: Comprehensive/Laropal A-81"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Acetone"}, {$set: {
    active: true
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Ethanol"}, {$set: {
    active: true
  }})
}

async function migrateToVersion_20()
{
  await mongoose.connection.db.collection('materials').updateMany(
    {}, // filtro vuoto = tutti i documenti
    { $set: { active: false } } // campo da aggiornare
  );
  await mongoose.connection.db.collection('materials').updateOne({name:"Water Distilled"}, {$set: {
    active: true,
    hazard_assessments: {G1: 0,G2: 0} 
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Cotton"}, {$set: {
    active: true,
    hazard_assessments: {G1: 0,G2: 0} 
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Evolon"}, {$set: {
    active: true,
    hazard_assessments: {G1: 0,G2: 0} 
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Paraloid B-72"}, {$set: {
    active: true,
    hazard_assessments: {G1: "?",G2: "?"},
    lca_data: {
      v_001:{
        G1: { value: 0.00000002581489731641220},
        G2: { value: 0.00001361736284410600000},
        G5: { value: 9.526 },
        G6: { value: 0.02641884768337230000000 },
        G7: { value: 0 },
      }
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Epoxy Resin, 2-Component: Comprehensive"}, {$set: {
    type:"substances",
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    },
    reference_amount: 1,
    lca_data: {
      v_001:{
        G1: { value: 0.00000002908365858778020 },
        G2: { value: 0.00001671896937317570000},
        G5: { value: 6.364 },
        G6: { value: 0.03391451416862180000000 },
        G7: { value: 0 },
      }
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Klucel G, M"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    },
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Synperonic A7"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Triton X"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Water Deionized"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: 0,
      G2: 0
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Aldehyde Resin: Comprehensive/Laropal A-81"}, {$set: {
    active: true,
    hazard_assessments: {
      G1: "?",
      G2: "?"
    }
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Acetone"}, {$set: {
    active: true
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Ethanol"}, {$set: {
    active: true
  }})
}

async function migrateToVersion_19()
{
  await mongoose.connection.db.collection('materials').updateOne({name:"Isopropanol (Isopropyl Alcohol)"}, {$set: {hazard_assessments: {G1: 3,G2: 4} }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Ethyl Acetate"}, {$set: {hazard_assessments: {G1: 3,G2: 4.5} }})
}

async function migrateToVersion_18()
{
  await mongoose.connection.db.collection('materials').updateMany({},{ $unset: { uuid: "" } });
  await mongoose.connection.db.collection('materials').updateMany({},{ $unset: { activity_name: "" } });
  await mongoose.connection.db.collection('materials').updateMany({},{ $unset: { geography: "" } });
  await mongoose.connection.db.collection('materials').updateMany({},{ $unset: { version: "" } });
  await mongoose.connection.db.collection('materials').updateMany({},{ $unset: { physical_state: "" } });
}

async function migrateToVersion_17()
{
  const collections = [
    'ecoinvent_versions',
    'ecoinvent_products',
    'actions',
    'materials_fake',
    'materials_fakes',
    'missions',
    'processes',
    'resources',
    'techniques'
  ];

  const existingCollections = await mongoose.connection.db
    .listCollections({}, { nameOnly: true })
    .toArray();

  const existingNames = existingCollections.map(c => c.name);

  for (const name of collections) {
    if (existingNames.includes(name)) {
      await mongoose.connection.db.dropCollection(name);
      console.log(`Dropped ${name}`);
    } else {
      console.log(`Skipped ${name} (not found)`);
    }
  }
}

async function migrateToVersion_16()
{
  await mongoose.connection.db.collection('materials').updateMany(
    {},
    {
      $set: { is_solvent: false },
      $unset: { category: "" }
    }
  )
}

async function migrateToVersion_15()
{
  await mongoose.connection.db.collection('materials').updateMany({}, {$set: { category: "" }})
}

async function migrateToVersion_14()
{
  await mongoose.connection.db.collection('materials').updateOne({name:"Acetone"}, {$set: {
    hazard_assessments: {
      G1: 5,
      G2: 4.5
    } 
  }})
  await mongoose.connection.db.collection('materials').updateOne({name:"Ethanol"}, {$set: {
    hazard_assessments: {
      G1: 3,
      G2: 4
    } 
  }})
}

async function migrateToVersion_13()
{
  await mongoose.connection.db.collection('settings').insertOne({
    name: 'lca_version_document',
    version: 1
  });
}

async function migrateToVersion_12()
{
  result = await mongoose.connection.db.collection('materials').updateMany({type:"tools"}, {$set:{type:"items"}})
}

async function migrateToVersion_11()
{
  result = await mongoose.connection.db.collection('materials').updateOne({name:"Ethanol"}, {$set:{
    reference_amount: 1,
    lca_data: {
      relative_density: 0.789, // normalizzazione in grammi = peso in ml * densità / 1000
      v_001:{
        G1: { value: 0.0000589741 },
        G2: { value: 0.00000628368},
        G5: { value: 1.558058808 },
        G6: { value: 9.768859801 },
        G7: { value: 1 },
      }
    }
  }})
  result = await mongoose.connection.db.collection('materials').updateOne({name:"Acetone"}, {$set:{
    reference_amount: 1,
    lca_data: {
      relative_density: 0.784, // normalizzazione in grammi = peso in ml * densità / 1000
      v_001:{
        G1: { value: 0.0000430 },
        G2: { value: 0.0000047817},
        G5: { value: 1.88997261990784 },
        G6: { value: 7.748758689 },
        G7: { value: 1 },
      }
    }
  }})
  esult = await mongoose.connection.db.collection('materials').updateOne({name:"Cotton"}, {$set:{
    reference_amount: 1,
    lca_data: {
      v_001:{
        G1: { value: 0.00000014068 },
        G2: { value: 0.0000240402},
        G5: { value: 1.03000954643321 },
        G6: { value: 4433.543577 },
        G7: { value: 10 },
      }
    }
  }})
  result = await mongoose.connection.db.collection('materials').insertOne({
    name:"Evolon",
    active: true,
    type: "tools",
    activity_name: "market for cellulose fibre",
    geography: "RoW",
    reference_unit: "kg",
    reference_amount: 1,
    lca_data: {
      v_001:{
        G1: { value: 0.00000000176119 },
        G2: { value: 0.00000164114},
        G5: { value: 0.284747239 },
        G6: { value: 1.655023871 },
        G7: { value: 1 },
      }
    }
  })
}

async function migrateToVersion_10()
{
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G7"}, {$set:{comparison: "both"}})
}

async function migrateToVersion_9()
{
  await mongoose.connection.db.collection('green_parameter_groups').updateOne({slug:"hazard_impacts_on_human_and_environment"}, {$set:{color: "bg-cyan"}})
  await mongoose.connection.db.collection('green_parameter_groups').updateOne({slug:"impacts_on_climate_change"}, {$set:{color: "bg-lime"}})
  await mongoose.connection.db.collection('green_parameter_groups').updateOne({slug:"impacts_on_resources"}, {$set:{color: "bg-fuchsia"}})
  await mongoose.connection.db.collection('green_parameter_groups').updateOne({slug:"art_work_specific"}, {$set:{color: "bg-yellow"}})
}

async function migrateToVersion_8()
{
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G1"}, {$set:{comparison: "both"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G2"}, {$set:{comparison: "both"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G3"}, {$set:{comparison: "treatments"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G4"}, {$set:{comparison: "treatments"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G5"}, {$set:{comparison: "both"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G6"}, {$set:{comparison: "both"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G7"}, {$set:{comparison: "treatments"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G8"}, {$set:{comparison: "treatments"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G9"}, {$set:{comparison: "treatments"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G10"}, {$set:{comparison: "treatments"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G11"}, {$set:{comparison: "treatments"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G12"}, {$set:{comparison: "treatments"}})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G13"}, {$set:{
    comparison: "treatments",
    name: "Accessibility - Ease of use and time",
    slug: "ease_of_use"
  }})
  await mongoose.connection.db.collection('green_parameters').updateOne({code:"G14"}, {$set:{
    comparison: "treatments",
    name: "Quality / value impacts of result in meeting preservation goals",
    slug: "quality_of_result"
  }})
}


async function migrateToVersion_7()
{
  let result = {}
  result = await mongoose.connection.db.collection('materials').updateOne({name:"Acetone"}, {$set:{
    reference_amount: 1,
    lca_data: {
      relative_density: 0.784, // normalizzazione in grammi = peso in ml * densità / 1000
      v_001:{
        G1: { value: 0.0000430 },
        G2: { value: 0.0000047817},
        G5: { value: 1.88997261990784 },
        G6: { value: 7.748758689 },
      }
    }
  }})
  result = await mongoose.connection.db.collection('materials').updateOne({name:"Ethanol"}, {$set:{
    reference_amount: 1,
    lca_data: {
      relative_density: 0.789, // normalizzazione in grammi = peso in ml * densità / 1000
      v_001:{
        G1: { value: 0.0000589741 },
        G2: { value: 0.00000628368},
        G5: { value: 1.558058808 },
        G6: { value: 9.768859801 },
      }
    }
  }})
  result = await mongoose.connection.db.collection('materials').updateOne({name:"Cotton"}, {$set:{
    reference_amount: 1,
    lca_data: {
      v_001:{
        G1: { value: 0.00000014068 },
        G2: { value: 0.0000240402},
        G5: { value: 1.03000954643321 },
        G6: { value: 4433.543577 },
      }
    }
  }})
  result = await mongoose.connection.db.collection('materials').insertOne({
    name:"Evolon",
    active: true,
    type: "tools",
    activity_name: "market for cellulose fibre",
    geography: "RoW",
    reference_unit: "kg",
    reference_amount: 1,
    lca_data: {
      v_001:{
        G1: { value: 0.00000000176119 },
        G2: { value: 0.00000164114},
        G5: { value: 0.284747239 },
        G6: { value: 1.655023871 },
      }
    }
  })
  await mongoose.connection.db.collection('settings').insertOne({
    name:"lca_version",
    version: 1
  })
  await mongoose.connection.db.collection('settings').updateOne({name:"dbVersion"}, {$set:{
    name: "db_version"
  }})
}

async function migrateToVersion_6()
{
  await mongoose.connection.db.collection('useful_links').deleteMany({});
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:6,relevant:true,topic:'Energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; interventive; preventive',medium_type:'Case studies; literature; webinars; podcasts; tools',access:'Free; registration required',name:'ICON Sustainability Group',description:'A cross-disciplinary group to encourage the take up of positive environmental practices in cultural heritage. A practical Group providing solutions, case studies on good environmental practice, crowdsourcing of ideas to solve those knotty environmental questions, \'how to\' advice, and a way to share and recycle materials and equipment.',link:'https://www.icon.org.uk/groups-and-networks/sustainability-group.html',owner:'The Insitute of Conservation'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:2,relevant:true,topic:'materials; LCA; carbon calulator; interventive; preventive;',medium_type:'Case studies; toolkit; tool',access:'Free',name:'Sustainability Tools in Cultural Heritage (STiCH)',description:'STiCH is a life cycle assessment (LCA) Carbon Calculator and Library of Case Studies and Information Sheets developed to help cultural heritage professionals make educated, sustainable choices to lower the environmental impact of their work.',link:'https://stich.culturalheritage.org/',owner:'Contributions by FAIC, Pratt, Northeastern U. Carbon calculator used database ecoinvent 3.6, a commercial database of environmental data for thousands of products and processes, published in Switzerland (https://ecoinvent.org/). '})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:23,relevant:false,topic:'LCA; preventive; interventive',medium_type:'Case studies; training platform',access:'Free',name:'OpenLCA',description:'LCA case studies (mostly free)',link:'OpenLCA',owner:'GreenDelta (Berlin)'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:24,relevant:false,topic:'LCA; preventive; interventive',medium_type:'Case studies; training platform',access:'Free',name:'NEXUS OPENLCA',description:'openLCA Nexus is an online repository for LCA data. It combines data offered by world-leading LCA data providers such as PE International (GaBi databases), the ecoinvent centre (ecoinvent), or the Joint Research Centre from the European Commission (ELCD).',link:'https://nexus.openlca.org/databases',owner:'GreenDelta (Berlin)'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:5,relevant:true,topic:'Energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; interventive; preventive',medium_type:'Case studies; wikipedia; podcast; webinars; literature; newsletter',access:'Free',name:'AIC Sustainable Practices Wiki',description:'Sustainability wiki for conservators maintained by members of the American Institute for Conservation\'s Sustainability Committee. Resources include: newsletter, podcasts, webinars, introductions to sustainability, specific materials, sustainable engergy use, case studies etc.',link:'https://www.conservation-wiki.com/wiki/Sustainable_Practices',owner:'American Institute for Conservation\'s Sustainability Committee'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:9,relevant:true,topic:'preventive; interventive',medium_type:'Literature; webinars; podcasts',access:'Free',name:'GoGreen - Bibliography',description:'A list of resources compiled by SiC and in the process of defining green conservation in the GoGreen EU Horizon project.',link:'TBC',owner:'GoGreen EU Horizon'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:28,relevant:false,topic:'preventive; interventive',medium_type:'Literature; webinars; podcasts',access:'Free',name:'Sustainability in Cultural Heritage Preservation & Conservation Resource Bank',description:'Bibliography by AIC Sustainability Committee',link:'https://www.zotero.org/aic-sustainability_committee',owner:'AIC Sustainability Committee'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:29,relevant:false,topic:'interventive',medium_type:'Podcast',access:'Free',name:'Conservators combatting climate change',description:'',link:'https://www.youtube.com/playlist?list=PLH0WXCtI2nojnbAFGZb0cTl-jfhagcNKm',owner:'AIC '})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:8,relevant:true,topic:'preventive; interventive',medium_type:'Podcast',access:'Free',name:'Green Tea Podcast',description:'A podcast about cultural heritage preservation and sustainability. Green Tea seeks to engage its listeners with contemporary topics about cultural heritage and sustainability. Hosted by the American Institute for Conservation\'s Sustainability Committee, we speak with experts and changemakers as they share success stories, big ideas, and inspiration for change to combat the climate crisis and its effects. From individuals to large institutions, we can all make a positive impact for our collections, our people, our heritage and our planet.',link:'https://open.spotify.com/show/3b5jkqeiZEVasHKHZNlMf1',owner:'AIC Sustainability Committee'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:12,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Reference database',access:'Free',name:'ECHA CHEM (REACH)',description:'ECHA CHEM is the European Chemicals Agency\'s (ECHA) public chemicals database. It is designed to publish and share information on chemicals. The first release of ECHA CHEM includes data from over 100,000 REACH registrations (Registration, Evaluation, Authorisation and Restriction of Chemicals).',link:'https://echa.europa.eu/substance-information',owner:'European Chemicals Agency'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:13,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Reference database',access:'Free',name:'PubChem',description:'PubChem is the world\'s largest collection of freely accessible chemical information',link:'https://pubchem.ncbi.nlm.nih.gov/ National Library of Medicine',owner:'National Institutes of Health (NIH)'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:17,relevant:false,topic:'Chemical information database; materials; interventive',medium_type:'Reference database',access:'Free',name:'CompTox Chemcals Dashboard',description:'The CompTox Chemicals Dashboard provides public access to chemical data. It is a widely used resource for chemistry, toxicity, and exposure information for over a million chemicals. The available data includes, but is not limited to, chemical properties, environmental fate and transport, hazard (e.g., point of departure, legacy toxicity values, screening levels, exposure limits), in vitro to in vivo extrapolation (IVIVE), exposure (e.g., predictions associated with the ExpoCast effort, use categories, toxic release inventory, monitoring data), bioactivity (e.g., high-throughput data from ToxCast and Tox21 efforts). In addition, the Dashboard provides information on similar chemicals and related substances, chemical lists, links out to other reputable resources, including Open Source widgets and tools.',link:'https://comptox.epa.gov/dashboard/',owner:'Environmental Protection Agency (EPA)'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:18,relevant:false,topic:'Chemical information database; materials; interventive',medium_type:'Reference database',access:'Free',name:'Ecological Structure Activity Relationships (ECOSAR) ',description:'The ECOSAR Class Program is a computerized predictive system that estimates aquatic toxicity. The program estimates a chemical\'s acute (short-term) toxicity and chronic (long-term or delayed) toxicity to aquatic organisms, such as fish, aquatic invertebrates, and aquatic plants, by using computerized Structure Activity Relationships (SARs).',link:'https://www.epa.gov/tsca-screening-tools/ecological-structure-activity-relationships-ecosar-predictive-model',owner:'U.S. Environmental Protection Agency'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:14,relevant:false,topic:'Solvent assessment; interventive',medium_type:'Reference database',access:'Free',name:'CHEM21',description:'Prat et al. published CHEM21 selection guide based on health, safety, and environmental criteria, which includes not only classical solvents, but also emerging solvents, such as bio-derived solvents. Solvents are defined as: Recommended: solvents to be tested first in a screening exercise, if of course there is no chemical incompatibility in the process conditions. Problematic: these solvents can be used in the lab, but their implementation in the pilot plant or at the production scale will require specific measures, or significant energy consumption Hazardous: the constraints on scale-up are very strong. The substitution of these solvents during process development is a priority Highly Hazardous: solvents to be avoided, even in the laboratory ',link:'https://www.jk-sci.com/blogs/resource-center/green-solvent-selection-guide',owner:''})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:14,relevant:true,topic:'Solvents; risk assessment; interventive',medium_type:'Solvents; risk assessment in conservation; interventive',access:'Free',name:'Fife Solvent Star',description:'visual documentation of solvent tests for coatings removal from paintings',link:'Solvent star',owner:'Fife/SRAL '})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:19,relevant:false,topic:'Chemical information database; materials; interventive',medium_type:'Tool',access:'',name:'GSCE Compass Rose',description:'Chemistry education (visual tool)',link:'',owner:''})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:16,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Tool',access:'Registration required',name:'Intermatter',description:'Impact tool calculator for interior design. The Inter Matter team developed the classification tool based on science and open-source data from the Idemat platform that is developed by TU-Delft. The tool generates an assessment based on 20% of the life cycle of a material that generates 80% impact.',link:'https://www.intermatter.nl/',owner:'Intermatter'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:10,relevant:true,topic:'Risk assessment; preventive',medium_type:'Tool',access:'Free; registration required',name:'HERIe',description:'Digital decision-supporting platform providing remote access to data manipulation tools and to quantitative assessment of risks to heritage assets. The platform is organised in the framework of ten independent modules corresponding to ten agents of deterioration. Ten deterioration agents: RH/T/criminal acts/pests/contaminants/light radiation/water/physical forces/neglect. Various tools actually combined: mechanical damage functions due to environmental fluctuations for restrained wood, panel paintings, parchment; chemical degradation; fire risk; contaminants (indoor concentration gas pollutants); light damage calculator. This review focussed on mechanical damage tool since this is specified in GoGreen project as parameter.',link:'https://herie.pl/',owner:'Jerzy Haber Institute of Catalysis and Surface Chemistry, Polish Academy of Sciences (ICSC PAS)'} )
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:21,relevant:false,topic:'Solvent information database; materials; interventive',medium_type:'Tool',access:'Free',name:'Green solvent selection tool',description:'The Solvent Ranking Table orders the solvents by their distance (Ra) to the solute in the Hansen space, i.e. by their similarity in solubility capacity. You can alternatively rank the solvents according to their composite sustainability score (G, a higher value represents a more sustainable alternative), boiling point (bp), viscosity (η), or surface tension (𝜎). By selecting a solvent in the Hansen space or the Solvent Ranking Table you get information regarding chemical structure, physical properties, and sustainability indicators.',link:'https://green-solvent-tool.herokuapp.com/',owner:'The Organic Photonics & Electronics Group; Umea University'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:20,relevant:false,topic:'Solvents; interventive',medium_type:'Tool',access:'Free',name:'ACS solvent selection tool',description:'This tool allows you interactively select solvents based upon the Principal Component Analysis (PCA) of the solvent\'s physical properties. Solvents which are close to each other in the map have similar physical and chemical properties, whereas distance solvents are significantly different. In addition to the PCA scores other data including the physical properties, functional groups and environmental data has been included to aid in the rational selection of solvents.',link:'https://www.acs.org/greenchemistry/research-innovation/tools-for-green-chemistry/solvent-tool.html',owner:'American chemical society'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:27,relevant:false,topic:'LCA; preventive; interventive',medium_type:'Tool;',access:'Free; registration required',name:'ecoQuery',description:'LCA data',link:'https://ecoquery.ecoinvent.org/3.10/cutoff/search',owner:''})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:26,relevant:false,topic:'LCA;  preventive; interventive',medium_type:'Tool; ',access:'Paid; registration required',name:'ecoinvent',description:'LCA data',link:'https://ecoinvent.org/',owner:'ecoinvent'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:25,relevant:false,topic:'LCA; preventive; interventive',medium_type:'Tool; application',access:'',name:'Idemat',description:'Idemat is a sustainability inspired materials selection app, empowering designers to create more sustainable products. Idemat features two impact indicators to express environmental burden: eco-costs – developed by Delft University of Technology – and carbon footprint. Choosing either one allows for the selection of one of three scenarios, which are explained in detail in the app. What happens with a material near the end of its life can have a significant contribution regarding its environmental impact. By integrating these so called end-of-life scenarios at the start of the selection process, a complex and error prone step is greatly simplified.',link:'https://idematapp.com/',owner:'Idemat TU Delft'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:31,relevant:false,topic:'energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; preventive; interventive',medium_type:'Tool; literature',access:'Free',name:'Environmental Protection Agency (United States)',description:'EAP has assembled more than 60 tools and resources to help participants, stakeholders, and assessment teams address various area of improvement.',link:'https://www.epa.gov/e3/e3-sustainability-tools',owner:'Environmental Protection Agency USA'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:4,relevant:true,topic:'LCA; preventive; interventive',medium_type:'Tool; toolkit; training platform; case studies; carbon calculator; blog',access:'Free; registration required',name:'Gallery Climate Coalition / GCC Carbon Calculator',description:'GCC is an international membership organisation providing environmental sustainability guidelines for the art sector, including various toolkits and a carbon calculator. GCC has identified three primary sources of carbon emissions common to galleries, institutions, artist studios, and businesses in the art sector: travel, shipping and building energy consumption. These are key data points that we encourage users to prioritise when creating a carbon report. The calculator also provides additional data categories to give users a full picture of their emissions across categories including surface travel, accommodation, materials and digital. Users are given a full breakdown of their carbon emissions, with visuals, at the end of the report to reflect on and proactively make changes within their organisations. Completing an annual carbon report will allow users to gain a GCC active membership status. You can learn more about active membership here.collection of links to useful databases and websites related to artists (and some conservation related) materials',link:'https://galleryclimatecoalition.org/',owner:'Gallery Climat Coalition'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:1,relevant:true,topic:'Sustainable development goals; energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; preventive; interventive',medium_type:'Tool; toolkit; training programme; forum; case studies',access:'Paid; registration required',name:'Ki Futures / Ki Port',description:'Ki Futures is an international coaching and training network. The comprehensive program provides everything that an institution needs to become sustainable, from tools and guides to training and mentoring, as well as connecting to local and global networks of sustainability leaders. The Ki Port is a customised online platform that powers Ki Futures. Here, Champions and Coaches can connect, share successes, and get inspired by sustainability pioneers around the world. The Ki Port houses all Ki Futures guides, resources, and recorded trainings, as well as a database of user-generated Ki Reports (case studies). ',link:'https://www.kiculture.org/ki-futures/',owner:'Ki Culture'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:15,relevant:true,topic:'Chemical information database; materials; interventive',medium_type:'Tool; training platform;',access:'Free',name:'Greener Solvent database',description:'Comparative database for solvents with chemical and physical data, safety data (includes CHEM21, hazards and occupational exposures)',link:'https://siconserve.wpengine.com/greener-solvents/greener-solvents-research-platform/',owner:'Hosted by Sustainability in Conservation project partner the University of Delaware'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:22,relevant:false,topic:'Greenhouse gas emissions; LCA; preventive; interventive',medium_type:'Tool; training platform;',access:'',name:'GHG emissions calculation tool',description:'GHG Protocol tools enable companies and cities to develop comprehensive and reliable inventories of their GHG emissions, and help countries and cities track progress toward their climate goals. ',link:'https://ghgprotocol.org/calculation-tools',owner:''})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:3,relevant:true,topic:'Sustainable development goals; preventive; interventive',medium_type:'Toolkit; case studies; literature; webinars; self-assessment tool',access:'Free',name:'Our Collections Matter / OCM Toolkit',description:'Platform that offers resources to implement sustainable development related to SDGs through the 3T strategy: tools (provide toolkits, concretely address SDG targets, measure and report progress), training (use toolkit, connect conservation and collections and sustainable development, empower) and transformation (communities, mindsets, behaviour). Introduction: https://www.iccrom.org/programmes/our-collections-matter',link:'https://ocm.iccrom.org/',owner:'International Centre for the Study of the Preservation and Restoration of Cultural Property (ICCROM)'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:7,relevant:true,topic:'Energy, materials; waste; water; LCA; climate control; lighting; exhibitions; storage; climate change; interventive; preventive',medium_type:'Training programme',access:'Free; registration required',name:'IIC Net Zero Programme',description:'IIC Net Zero aligns to the United Nations Framework Convention on Climate Change (UNFCCC): Race to Zero Partnership Campaign. As 2023 and 2024 set to become the warmest years on record, and as the UN warns the world is heading for 3°C of climate warming, our sector must set a credible path to cutting carbon emissions. Driven by the Joint Commitment for Climate Action in Cultural Heritage Conservation between IIC, ICCROM and ICOM-CC, this programme will support professionals in small and large institutions as well as freelancers to build momentum to meet the goals of the 1.5°C threshold set by the Paris Agreement and help accelerate the transition to a net zero sector. It aims for the conservation field to show leadership by committing to the Net Zero pledge, setting science-based targets, taking action and reporting on the positive changes achieved.',link:'https://www.iiconservation.org/iic-net-zero-project',owner:'International Institute for conservation of historic and artistic works '})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:30,relevant:false,topic:'interventive',medium_type:'Webinar',access:'Free',name:'Sustainable Practices in Heritage Conservation',description:'',link:'https://www.youtube.com/playlist?list=PLH0WXCtI2nojU-QsPpZleHjnqEdUExQLV',owner:'AIC'})
  await mongoose.connection.db.collection('useful_links').insertOne({_id:new mongoose.Types.ObjectId(),order:32,relevant:false,topic:'preventive; interventive',medium_type:'Webinar',access:'Free',name:'Sustainable Packing, Moving and Storage',description:'',link:'https://www.youtube.com/playlist?list=PLH0WXCtI2noiOPBhGRj0rGNg4Hk3uiUfO',owner:'AIC '})
}
async function migrateToVersion_5()
{
  await ModelByEntity("green_parameter_groups").findOneAndUpdate({ slug:'hazard_impacts_on_human_and_environment'}, { $set: { sort:1}}, {new: true, upsert: false})
  await ModelByEntity("green_parameter_groups").findOneAndUpdate({ slug:'impacts_on_climate_change'}, { $set: { sort:2}}, {new: true, upsert: false})
  await ModelByEntity("green_parameter_groups").findOneAndUpdate({ slug:'impacts_on_resources'}, { $set: { sort:3}}, {new: true, upsert: false})
  await ModelByEntity("green_parameter_groups").findOneAndUpdate({ slug:'art_work_specific'}, { $set: { sort:4}}, {new: true, upsert: false})
}
async function migrateToVersion_4()
{
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G1'}, { $set: { name:'Toxicity and hazard metrics for environment'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G2'}, { $set: { name:'Toxicity and hazard metrics for humans'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G3'}, { $set: { name:'Energy, indoor climate control impacts'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G4'}, { $set: { name:'Energy, consumption in approach/application for treatment'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G5'}, { $set: { name:'Energy, conservation/treatment-associated materials/products to be used'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G6'}, { $set: { name:'Availability, water use and resource depletion'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G7'}, { $set: { name:'Availability, biodiversity impact'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G8'}, { $set: { name:'Waste'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G9'}, { $set: { name:'Material/product selection and application method'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G10'}, { $set: { name:'Number of applications/quantities/consumption of materials used'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G11'}, { $set: { name:'Longevity of result'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G12'}, { $set: { name:'Accessibility, availability of used materials/products and transport'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G13'}, { $set: { name:'Quality of result, value in meeting preservation goals'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'G14'}, { $set: { name:'Accessibility, ease of use and time needed '}}, {new: true, upsert: false})
  await ModelByEntity("green_parameter_groups").findOneAndUpdate({ slug:'art_work_specific'}, { $set: { name:'object, treatment specific/professional parameters'}}, {new: true, upsert: false})
}
async function migrateToVersion_3()
{
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'S12'}, { $set: { code:'G12'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'S13'}, { $set: { code:'G13'}}, {new: true, upsert: false})
  await ModelByEntity("green_parameters").findOneAndUpdate({ code:'S14'}, { $set: { code:'G14'}}, {new: true, upsert: false})
}
async function migrateToVersion_2()
{
  const storagePath = path.join(process.cwd(), 'storage');
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
    console.log(`Cartella 'storage' creata in ${storagePath}`);
  } else {
    console.log(`Cartella 'storage' già esistente in ${storagePath}`);
  }
  dbVersionObj.version = dbVersion+1
}

async function migrateToVersion_1()
{
  const doc = await ModelByEntity("roles").findOneAndUpdate({ name:'Bigone'}, { $set: { slug:'big_one', name:"Big one"}}, {new: true, upsert: true})
  await ModelByEntity("roles").findOneAndUpdate({ name:'Administrator'}, { $set: { slug:'administrator'}}, {new: true, upsert: true})
  await ModelByEntity("roles").findOneAndUpdate({ name:'User'}, { $set: { slug:'user'}}, {new: true, upsert: true})
  await ModelByEntity("roles").findOneAndUpdate({ name:'Editor'}, { $set: { slug:'editor'}}, {new: true, upsert: true})
  await ModelByEntity("users").updateMany({}, { $set: { role_slug: 'administrator' }}, {new: true, upsert: true})
  await ModelByEntity("users").updateMany({}, { $unset: { role_id: '' }}, {new: true, upsert: true})
}

function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

async function registerUser(name, email, password, count)
{
  const existingUser = await new ModelByEntity("users").findOne({ email });
  if (existingUser) {
    console.log("EXISTS "+count)
    return
  }
  try {
    const saltHash = genPassword(password);
    const { salt, hash } = saltHash
    const fields = {}
    fields._id = new mongoose.Types.ObjectId()
    fields.createdAt = new Date()
    fields.createdBy = null
    fields.updatedAt = null
    fields.updatedBy = null
    fields.deletedAt = null
    fields.deletedBy = null
    fields.name = name
    fields.username = email
    fields.email = email
    fields.hash = hash
    fields.salt = salt
    fields.role_slug = 'user'
    const item = new ModelByEntity("users")(fields);
    await item.save();
    console.log("OK "+count)
  } catch(e) {
    console.log("### registerUser Error!", count, name, email, password, e)
  }
}

async function emailIsvalid(email){
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

const testers_2 = [
  {
    email: "erika@acrosstheglass.it",
    password: "Er7@kL9mQ2tA",
    name: "Erika Fracassa"
  },
  {
    email: "luciacorraz@gmail.com",
    password: "Lu4!cR8vN1sD",
    name: "Lucia Corrain"
  },
  {
    email: "auroralorenzin@ivbc.it",
    password: "Au9-mR2kT7pL",
    name: "Aurora Lorenzin"
  },
  {
    email: "giadacarloni16@gmail.com",
    password: "Gi3@dL8nQ5vR",
    name: "Giada Carloni"
  },
  {
    email: "aavossaa@gmail.com",
    password: "An6!sV9cR2tK",
    name: "Anais Avossa"
  },
  {
    email: "caterina.mariano@ivbc.it",
    password: "Ca8@tR1nM6pQ",
    name: "Anna Caterina Mariano"
  },
  {
    email: "manai_elisa@hotmail.com",
    password: "El5!sM7nR2vT",
    name: "Elisa Manai"
  },
  {
    email: "michela.monari04@gmail.com",
    password: "Mi9@hL2aR8vS",
    name: "Michela Monari"
  },
  {
    email: "elenina.2000@libero.it",
    password: "El2!nV7sT9mQ",
    name: "Elena Vespasiano"
  },
  {
    email: "mariaelena.mura@ivbc.it",
    password: "Ma8@rE3nL6vP",
    name: "Maria Elena Mura"
  },
  {
    email: "j.bribiesca@gmail.com",
    password: "Vi7!rJ2mN9aQ",
    name: "Viriniana Jimenez Bribiesca"
  },
  {
    email: "giuliag.padovan@gmail.com",
    password: "Gi6@lP8dR1nT",
    name: "Giulia Padovan"
  },
  {
    email: "beatrice.falconi@gmail.com",
    password: "Be3!aF9lQ2vR",
    name: "Beatrice Flconi"
  },
  {
    email: "chiara.zardinoni@ivbc.it",
    password: "Ch8@rZ1dN5mK",
    name: "Chiara Zardinoni"
  },
  {
    email: "anna.vis95@gmail.com",
    password: "An7!vS2tL9rQ",
    name: "Anna Visentin"
  },
  {
    email: "aretzl01@buffalostate.edu",
    password: "Le4@hA8rT2zM",
    name: "Leah Aretz"
  },
  {
    email: "valeriagalizzi.restauro@gmail.com",
    password: "R8@tL3vM1qSa",
    name: "Valeria Galizzi"
  }
];

const testers = [
  {
    "email": "patina@sfr.fr",
    "password": "G7m!qA4t@Z2k",
    "name": "Janin Bechstedt"
  },
  {
    "email": "Abelizabeth.rod@gmail.com",
    "password": "Wp81Vj!whAIS",
    "name": "Abigail Rodriguez"
  },
  {
    "email": "ainhoa.escartin@nationalmuseum.ch",
    "password": "jNx@R2nvLZsd",
    "name": "Ainhoa Escartin"
  },
  {
    "email": "atelieraldomanzo@gmail.com",
    "password": "S!uoEn2TFIP7",
    "name": "Aldo Manzo"
  },
  {
    "email": "aldona.jedrusik@gmail.com",
    "password": "psR5X!ZRK7NH",
    "name": "Aldona Jędrusik"
  },
  {
    "email": "ackg2003@gmail.com",
    "password": "mzvQ5aIs5aX-",
    "name": "Alex Greenberg"
  },
  {
    "email": "Alex_Igraine_Wade@hotmail.com",
    "password": "-TdBvLHI3Wsj",
    "name": "Alex Wade"
  },
  {
    "email": "a.ioanes@campus.fct.unl.pt",
    "password": "-EoWs5c08eB-",
    "name": "Alexandra Maria Ioanes"
  },
  {
    "email": "alicia.stemplowski@outlook.fr",
    "password": "U53@AUI1zao@",
    "name": "Alicia Stemplowski"
  },
  {
    "email": "alineasd.oliveira@gmail.com",
    "password": "jxXVJNM@5CK@",
    "name": "Aline Assumpção de Oliveira"
  },
  {
    "email": "ayurovetskaya@gmail.com",
    "password": "1bjL-5@cw6DO",
    "name": "Anastasia Yurovetskaya"
  },
  {
    "email": "andromaxy.g@gmail.com",
    "password": "rFQi5P2@Nud8",
    "name": "ANDROMACHI GEORGIOU"
  },
  {
    "email": "prinsloo.angie@gmail.com",
    "password": "ARD0-!EVlkKt",
    "name": "Angie Prinsloo"
  },
  {
    "email": "anke1behrens@gmail.com",
    "password": "mFUYAv@F1pgD",
    "name": "Anke Behrens"
  },
  {
    "email": "a.l.johnson@soton.ac.uk",
    "password": "jc-tUPnxCva3",
    "name": "Anna Johnson"
  },
  {
    "email": "annalisamarra82@gmail.com",
    "password": "fYp-a2YprsRE",
    "name": "Annalisa Marra"
  },
  {
    "email": "anne-stephanie.etienne@pch.gc.ca",
    "password": "nKXhRfte5!u7",
    "name": "Anne-Stéphanie Etienne"
  },
  {
    "email": "anthony@limeworks.us",
    "password": "5nmXzm!VB-VE",
    "name": "Anthony Hita"
  },
  {
    "email": "ash.dupuis.cr@gmail.com",
    "password": "@SY3!E0VIace",
    "name": "Ash Dupuis"
  },
  {
    "email": "vasiliauskaite.asta@gmail.com",
    "password": "E9D@v!v6JNWn",
    "name": "Asta Vasiliauskaite"
  },
  {
    "email": "info@aurorabelli.com",
    "password": "Nyl-nDW8!b9i",
    "name": "Aurora Belli"
  },
  {
    "email": "b.stabik@sral.nl",
    "password": "yQM8ujRot-IL",
    "name": "Bascha Stabik"
  },
  {
    "email": "B.Menegaldo@courtauld.ac.uk",
    "password": "DZu586K@j3j4",
    "name": "Beatrice Menegaldo"
  },
  {
    "email": "bhavesh.shah@english-heritage.org.uk",
    "password": "t!YIsY2@lLH9",
    "name": "Bhavesh Shah"
  },
  {
    "email": "bianca.ds.goncalves@gmail.com",
    "password": "81CRdHqN!UuG",
    "name": "Bianca Goncalves"
  },
  {
    "email": "camille-lowe@hotmail.com",
    "password": "V02qDeL4BnG@",
    "name": "Camille Turner-Hehlen"
  },
  {
    "email": "c.vatteroni@opapisa.it",
    "password": "-9Tnk1NVeyOQ",
    "name": "Carolina Vatteroni"
  },
  {
    "email": "catherine.didelot@madparis.fr",
    "password": "-ZoVe6sR0Y0j",
    "name": "Catherine Didelot"
  },
  {
    "email": "bianchi.conservation@gmail.com",
    "password": "uhpTrGA5Yco@",
    "name": "Chiara Bianchi"
  },
  {
    "email": "cstavrou@ix.netcom.com",
    "password": "V-S-48@b7eLs",
    "name": "Chris Stavroudis"
  },
  {
    "email": "christian.tortato@oltremodo.studio",
    "password": "@p2LGLyyAYXJ",
    "name": "Christian Tortato"
  },
  {
    "email": "claire.cuyaubere@culture.gouv.fr",
    "password": "6ddf6p@wWbKq",
    "name": "Claire Cuyaubère"
  },
  {
    "email": "Csilla.Karsay@gmail.com",
    "password": "p9k6VV3hEw!U",
    "name": "Csilla Karsay"
  },
  {
    "email": "david.thickett@english-heritage.org.uk",
    "password": "2gdv9@mvJyVe",
    "name": "David Thickett"
  },
  {
    "email": "d.schrijvers@weloop.org",
    "password": "U49ZfhIF!3t!",
    "name": "Dieuwertje Schrijvers"
  },
  {
    "email": "u25212495@tuks.co.za",
    "password": "cCc7jRzA!WNv",
    "name": "Edna Carter"
  },
  {
    "email": "eklieberman@comcast.net",
    "password": "vV-SpsbWyN9N",
    "name": "Eleanor Lieberman"
  },
  {
    "email": "kontakt@malerikonservering.com",
    "password": "!e7kHuqLBM9a",
    "name": "Elisabetta Bosetti"
  },
  {
    "email": "ehomberger@dia.org",
    "password": "DhgwI!gg2iOU",
    "name": "Elizabeth Homberger"
  },
  {
    "email": "eac93@cam.ac.uk",
    "password": "AKd-yY9a!d4k",
    "name": "Elizabeth Le Peuch"
  },
  {
    "email": "ellenvheteren@gmail.com",
    "password": "5MF8bRO-f@Do",
    "name": "Ellen van Heteren"
  },
  {
    "email": "evbiehl@gmail.com",
    "password": "U6fSl@VtECWM",
    "name": "Emily Biehl"
  },
  {
    "email": "Emy.kim@queensu.ca",
    "password": "6JB8K7Tq-bqb",
    "name": "Emy Kim"
  },
  {
    "email": "Vifes@uv.es",
    "password": "gz@6PIqVbfL6",
    "name": "Esperanza Villuendas"
  },
  {
    "email": "epaillaux@mairie-vienne.fr",
    "password": "aX73eUGqdQk-",
    "name": "Eve Paillaux"
  },
  {
    "email": "ekoek@getty.edu",
    "password": "mtCe!yr7RV@g",
    "name": "Ewout Koek"
  },
  {
    "email": "f.fekrsanati@stedelijk.nl",
    "password": "Gd6L5I!lEQzv",
    "name": "Farideh Fekrsanati"
  },
  {
    "email": "fiona@grahamconservation.com",
    "password": "iDwH7kJN-1N7",
    "name": "Fiona Graham"
  },
  {
    "email": "florenciagear@gmail.com",
    "password": "ivYpX2j6!SDO",
    "name": "Florencia Gear"
  },
  {
    "email": "F.elia@icsconservation.com",
    "password": "re3JGt@4vU!y",
    "name": "Francesca Elia"
  },
  {
    "email": "frederique.tissier@be.ch",
    "password": "u0UE4zXDF!MO",
    "name": "Frédérique Tissier"
  },
  {
    "email": "gagan110200@gmail.com",
    "password": "44cTY!emqt5l",
    "name": "Gagandeep Singh"
  },
  {
    "email": "gwen.fife@kiculture.org",
    "password": "mV!G1@yv-1@2",
    "name": "Gwen Fife"
  },
  {
    "email": "gwendolinefirmery@gmail.com",
    "password": "U-UqC2@F8NeO",
    "name": "Gwendoline Firmery"
  },
  {
    "email": "heather4j@gmail.com",
    "password": "YQLdDJmY7o-X",
    "name": "Heather Jackson"
  },
  {
    "email": "heleen.vansanten@muho.no",
    "password": "Vgz@U!5neGSs",
    "name": "Heleen van Santen"
  },
  {
    "email": "Besse.henk@gmail.com",
    "password": "9e-sgDCK67Sy",
    "name": "Hendrik Besse"
  },
  {
    "email": "isabelle.mcginn@up.ac.za",
    "password": "@0HtRirZeOWd",
    "name": "Isabelle McGinn"
  },
  {
    "email": "jay.tanner@unlv.edu",
    "password": "5xYPsNk@4t!4",
    "name": "Jay Tanner"
  },
  {
    "email": "jessica.pollard@dorsetcouncil.gov.uk",
    "password": "qfTW1ej@!OaK",
    "name": "Jessica Pollard"
  },
  {
    "email": "j.walthew@ucl.ac.uk",
    "password": "T7vE-b0pvz4F",
    "name": "Jessica Walthew"
  },
  {
    "email": "Jina.chang@nasjonalmuseet.no",
    "password": "s7wZSHFj-Y@A",
    "name": "Jina Chang"
  },
  {
    "email": "artmaster51@gmail.com",
    "password": "B!VCB!4ylUT5",
    "name": "Jonathan Fisher"
  },
  {
    "email": "Jordan@jhbholocaust.co.za",
    "password": "76zbi@w17UQY",
    "name": "Jordan Saltzman"
  },
  {
    "email": "julia.wagner@kiculture.org",
    "password": "9-5eLwhFgg82",
    "name": "Julia Wagner"
  },
  {
    "email": "j.mci.shapiro@gmail.com",
    "password": "s@aRt80gJt1-",
    "name": "Julie McIntosh Shapiro"
  },
  {
    "email": "katja.siebel@mkg-hamburg.de",
    "password": "l-aA-mW6DoYa",
    "name": "Katja Siebel"
  },
  {
    "email": "kim@galleryclimatecoalition.org",
    "password": "JAkH8@!f7Nt0",
    "name": "Kim Kraczon"
  },
  {
    "email": "kf@konsvejle.dk",
    "password": "isY!rChb!37O",
    "name": "Krassimira Frangova"
  },
  {
    "email": "Lisp@smk.dk",
    "password": "@RBoROk-5Mil",
    "name": "Lin Spaabaek"
  },
  {
    "email": "heritagechampions@gmail.com",
    "password": "d!Qbf47UnU9Q",
    "name": "Lorraine Finch"
  },
  {
    "email": "l.petrera@nhm.ac.uk",
    "password": "8TrYZbFCjvZ@",
    "name": "Lucia Petrera"
  },
  {
    "email": "lucyclegg02@gmail.com",
    "password": "YSh1Wpx!4EBD",
    "name": "Lucy Clegg"
  },
  {
    "email": "Luisa.casella@gmail.com",
    "password": "1tM1@CfboXXd",
    "name": "Luisa Casella"
  },
  {
    "email": "Luzvanasco@gmail.com",
    "password": "z8M4vhG!drE0",
    "name": "Luz vanasco"
  },
  {
    "email": "magdalenawsol@gmail.com",
    "password": "SVqWNaXXL!8y",
    "name": "Magdalena Wsół"
  },
  {
    "email": "magdalenawsol7@gmail.com",
    "password": "15l!DIV@ifF8",
    "name": "Magdalena Wsół"
  },
  {
    "email": "maggi.loubser@up.ac.za",
    "password": "-2s5EVo!fx7t",
    "name": "Maggi Loubser"
  },
  {
    "email": "meg@textileconservator.com",
    "password": "E1wC1Wma@!sl",
    "name": "Margaret Geiss-Mooney"
  },
  {
    "email": "mcanavan@ngi.ie",
    "password": "k!EFNqB7fEgT",
    "name": "Maria Canavan"
  },
  {
    "email": "mrla.petruzzellis@gmail.com",
    "password": "3o!RaMgwa6S2",
    "name": "Maria Laura Petruzzellis"
  },
  {
    "email": "marianna.cossino@gmail.com",
    "password": "1caBt-QKC73F",
    "name": "Marianna Cossino"
  },
  {
    "email": "mariannejoubert00@gmail.com",
    "password": "4Xj62cH544f@",
    "name": "Marianne Joubert"
  },
  {
    "email": "m.hupkes@sral.nl",
    "password": "RLZLu@w9jaAf",
    "name": "Marjolein Hupkes"
  },
  {
    "email": "marta.caroselli@supsi.ch",
    "password": "vYVqI13B3-ue",
    "name": "Marta Caroselli"
  },
  {
    "email": "Massimo.cruciotti@mazzinilab.it",
    "password": "CLZbj43Y!2JV",
    "name": "Massimo Cruciotti"
  },
  {
    "email": "meganaliciaoconnor@gmail.com",
    "password": "T5MleSJF-vx2",
    "name": "Megan O'Connor"
  },
  {
    "email": "miranda@dunnacs.com",
    "password": "jawF49j@19ik",
    "name": "Miranda Hope Dunn"
  },
  {
    "email": "mireille.brulotte@mcc.gouv.qc.ca",
    "password": "PFb1Z3@@gOpJ",
    "name": "Mireille Brulotte"
  },
  {
    "email": "m.okuyama@rijksmuseum.nl",
    "password": "GlzbEw!rZyx7",
    "name": "Momoko Okuyama"
  },
  {
    "email": "Monica.dinu@inoe.ro",
    "password": "QaVgI3E0y@tA",
    "name": "Monica Dinu"
  },
  {
    "email": "Natalie.Ellwanger@nationalmuseum.ch",
    "password": "@vbWlSx6v@9V",
    "name": "Natalie Ellwanger"
  },
  {
    "email": "nicola.shreeve@nationaltrust.org.uk",
    "password": "!bsM6n@EKRXj",
    "name": "Nicola Shreeve"
  },
  {
    "email": "u20640618@tuks.co.za",
    "password": "N@lATzvt80dg",
    "name": "Nina du Preez"
  },
  {
    "email": "nokushernad.nk@gmail.com",
    "password": "I9Vd!1VpNixD",
    "name": "Nokukhanya Khumalo"
  },
  {
    "email": "P.smithen@queensu.ca",
    "password": "c-W5r92XC2pR",
    "name": "Patricia Smithen"
  },
  {
    "email": "vieirapintop@hotmail.com",
    "password": "w@4lXxN3Wdxc",
    "name": "Patricia Vieira P."
  },
  {
    "email": "paula.correia.c@gmail.com",
    "password": "UFx9r@2UOMEQ",
    "name": "Paula Correia"
  },
  {
    "email": "Spijker49@hotmail.com",
    "password": "SXeBby!i3Pfz",
    "name": "Paulien Kaan"
  },
  {
    "email": "P.pronobis@zamek.malbork.pl",
    "password": "wkY5uBi!UHuK",
    "name": "Paweł Pronobis"
  },
  {
    "email": "raquel.marques.rm@gmail.com",
    "password": "4!ond7UuGY0Q",
    "name": "Raquel Marques"
  },
  {
    "email": "rnewberry@smm.org",
    "password": "Wx3-id3-Bpdp",
    "name": "Rebecca Newberry"
  },
  {
    "email": "conservators@gmail.com",
    "password": "Fge5!iCnQE4@",
    "name": "S. Girikumar"
  },
  {
    "email": "kunikata-s35@nich.go.jp",
    "password": "6Ziw8TO@2rv8",
    "name": "Saki Kunikata"
  },
  {
    "email": "sNunberg@aol.com",
    "password": "VnW83sYehIY-",
    "name": "Sarah Nunberg"
  },
  {
    "email": "sharonta@imj.org.il",
    "password": "GH93MRU0v!Qv",
    "name": "Sharon Tager"
  },
  {
    "email": "a2243290a@gmail.com",
    "password": "9Bm!M6vE3knv",
    "name": "SHIH MING-CHIA"
  },
  {
    "email": "s.pain@epi78-92.fr",
    "password": "D!swj78ufNd1",
    "name": "Silvia Pain"
  },
  {
    "email": "sophie.lewincamp@nfsa.gov.au",
    "password": "jZO!sTRU8e7c",
    "name": "Sophie Lewincamp"
  },
  {
    "email": "sophie.roberge@mcc.gouv.qc.ca",
    "password": "t!XnSJv9SpBT",
    "name": "Sophie Roberge"
  },
  {
    "email": "salcala@mfah.org",
    "password": "-qL49-hl1AM6",
    "name": "Soraya Alcalá"
  },
  {
    "email": "san11@fayoum.edu.eg",
    "password": "1A@mSgwHSceR",
    "name": "Souty Beskhyroun"
  },
  {
    "email": "stefanie.bruhin@nationalmuseum.ch",
    "password": "CPFQyJG6vE-z",
    "name": "Stefanie Bruhin"
  },
  {
    "email": "SdeRoemer@britishmuseum.org",
    "password": "qlRepuSY25c@",
    "name": "Steph de Roemer"
  },
  {
    "email": "stephanie.gagne@mcc.gouv.qc.ca",
    "password": "NfmqzUp7J4@h",
    "name": "Stéphanie Gagné"
  },
  {
    "email": "Conservation.indonesia@gmail.com",
    "password": "zZ8@x!WNz8yQ",
    "name": "Susanne Erhards"
  },
  {
    "email": "lipendat@gmail.com",
    "password": "cWN!4nbY3Y@4",
    "name": "Tulela Lipenda"
  },
  {
    "email": "Victoria.Ward@rijksmuseum.nl",
    "password": "X0D@D4gXl3!c",
    "name": "Victoria Ward"
  },
  {
    "email": "willidebarros@ufmg.br",
    "password": "S9keRiE!SgTW",
    "name": "Willi de Barros Goncalves"
  },
  {
    "email": "xu.chenyue@outlook.com",
    "password": "tx-3hF0VK4-0",
    "name": "Xu, Chenyue"
  },
  {
    "email": "yngve.magnusson@lillehammermuseum.no",
    "password": "yQkIeLlX-B1O",
    "name": "Yngve Magnusson"
  },
  {
    "email": "zosianoga@gmail.com",
    "password": "@I!SDswP4G94",
    "name": "Zofia Wyszomirska-Noga"
  }
]


module.exports = router