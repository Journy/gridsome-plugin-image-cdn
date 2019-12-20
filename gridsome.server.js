const transformers = require('./transformers')

function ImageCDN (api, options) {
  // Destructure plugin options
  const { site, cdn, types } = options

  // Get the configured transformer using either an option preset, or a custom transformer
  const { createSchemaTypes, createResolverArgs, transformer } = cdn.preset ? transformers[ cdn.preset ] : cdn.transformer

  api.loadSource(({ addSchemaTypes, schema, addSchemaResolvers }) => {
    // Create and add custom cdn schema types - i.e. width, heigh, crop mode
    const schemaTypes = createSchemaTypes(schema)
    addSchemaTypes(schemaTypes)

    // For each configured typeName, update the sourceField to include the cdn options
    for (const { typeName, sourceField } of types) {
      addSchemaResolvers({
        [ typeName ]: {
          [ sourceField ]: {
            // Add configured resolver args
            args: createResolverArgs() || {},
            resolve: (parent, args) => {
              const sourceUrl = parent[ sourceField ].replace(site.baseUrl, '')

              // If no transformer is configure, ignore it and return the opiginal url
              if (!transformer) return sourceUrl
              // Otherwise handoff to the transformer
              return transformer({ cdnUrl: cdn.baseUrl, sourceUrl, args })
            }
          }
        }
      })
    }
  })
}

module.exports = ImageCDN

module.exports.defaultOptions = () => ({
  types: []
})