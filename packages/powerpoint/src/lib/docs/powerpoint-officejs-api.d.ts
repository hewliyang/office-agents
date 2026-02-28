////////////////////////////////////////////////////////////////
//////////////////// Begin PowerPoint APIs /////////////////////
////////////////////////////////////////////////////////////////

export declare namespace PowerPoint {
  /**
   * Represents the PowerPoint application that manages the presentation.
   *
   * @remarks
   * [Api set: PowerPointApi 1.0]
   */
  export class Application extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Create a new instance of the `PowerPoint.Application` object.
     */
    static newObject(
      context: OfficeExtension.ClientRequestContext,
    ): PowerPoint.Application;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Application` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ApplicationData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): {
      [key: string]: string;
    };
  }
  /**
     * The `Presentation` object is the top-level object with one or more slides that contain the contents of the presentation.
                To learn more about the PowerPoint object model,
                see {@link https://learn.microsoft.com/office/dev/add-ins/powerpoint/core-concepts | PowerPoint JavaScript object model}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.0]
     */
  export class Presentation extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns a collection of bindings that are associated with the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly bindings: PowerPoint.BindingCollection;
    /**
     * Returns a collection of custom XML parts that are associated with the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly customXmlParts: PowerPoint.CustomXmlPartCollection;
    /**
     * Returns the page setup information whose properties control slide setup attributes for the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly pageSetup: PowerPoint.PageSetup;
    /**
     * Gets the properties of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly properties: PowerPoint.DocumentProperties;
    /**
     * Returns the collection of `SlideMaster` objects that are in the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly slideMasters: PowerPoint.SlideMasterCollection;
    /**
     * Returns an ordered collection of slides in the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.2]
     */
    readonly slides: PowerPoint.SlideCollection;
    /**
     * Returns a collection of tags attached to the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly tags: PowerPoint.TagCollection;
    /**
     * Gets the ID of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    readonly id: string;
    /**
     * Returns the title of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.0]
     */
    readonly title: string;
    /**
         * Returns the selected shapes in the current slide of the presentation.
                    If no shapes are selected, an empty collection is returned.
         *
         * @remarks
         * [Api set: PowerPointApi 1.5]
         */
    getSelectedShapes(): PowerPoint.ShapeScopedCollection;
    /**
         * Returns the selected slides in the current view of the presentation.
                    The first item in the collection is the active slide that is visible in the editing area.
                    If no slides are selected, an empty collection is returned.
         *
         * @remarks
         * [Api set: PowerPointApi 1.5]
         */
    getSelectedSlides(): PowerPoint.SlideScopedCollection;
    /**
         * Returns the selected {@link PowerPoint.TextRange} in the current view of the presentation.
                    Throws an exception if no text is selected.
         *
         * @remarks
         * [Api set: PowerPointApi 1.5]
         */
    getSelectedTextRange(): PowerPoint.TextRange;
    /**
         * Returns the selected {@link PowerPoint.TextRange} in the current view of the presentation.
                    If no text is selected, an object with an `isNullObject` property set to `true` is returned.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.5]
         */
    getSelectedTextRangeOrNullObject(): PowerPoint.TextRange;
    /**
     * Inserts the specified slides from a presentation into the current presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.2]
     *
     * @param base64File - The Base64-encoded string representing the source presentation file.
     * @param options - The options that define which slides will be inserted, where the new slides will go, and which presentation's formatting will be used.
     */
    insertSlidesFromBase64(
      base64File: string,
      options?: PowerPoint.InsertSlideOptions,
    ): void;
    /**
     * Selects the slides in the current view of the presentation. Existing slide selection is replaced with the new selection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     *
     * @param slideIds - List of slide IDs to select in the presentation. If the list is empty, selection is cleared.
     */
    setSelectedSlides(slideIds: string[]): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.PresentationLoadOptions,
    ): PowerPoint.Presentation;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Presentation;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Presentation;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Presentation` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.PresentationData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.PresentationData;
  }
  /**
   * Represents the available options when adding a new slide.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export interface AddSlideOptions {
    /**
         * Specifies the ID of a Slide Layout to be used for the new slide.
                    If no `layoutId` is provided, but a `slideMasterId` is provided, then the ID of the first layout from the specified Slide Master will be used.
                    If no `slideMasterId` is provided, but a `layoutId` is provided, then the specified layout needs to be available for the default Slide Master (as specified
                    in the `slideMasterId` description). Otherwise, an error will be thrown.
         *
         * @remarks
         * [Api set: PowerPointApi 1.3]
         */
    layoutId?: string;
    /**
         * Specifies the ID of a Slide Master to be used for the new slide.
                    If no `slideMasterId` is provided, then the previous slide's Slide Master will be used.
                    If there is no previous slide, then the presentation's first Slide Master will be used.
         *
         * @remarks
         * [Api set: PowerPointApi 1.3]
         */
    slideMasterId?: string;
  }
  /**
   * Represents the adjustment values for a shape.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class Adjustments extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies the number of adjustment points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly count: number;
    /**
         * Gets the adjustment value at the specified zero-based index.
                    Throws an `InvalidArgument` exception when the index is out of range.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         *
         * @param index - The index of the adjustment to retrieve.
         * @returns The adjustment value at the given index.
         */
    get(index: number): OfficeExtension.ClientResult<number>;
    /**
         * Sets the adjustment value at the specified zero-based index.
                    Throws an `InvalidArgument` exception when the index is out of range.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         *
         * @param index - The index of the adjustment to set.
         * @param value - The adjustment value to set.
         */
    set(index: number, value: number): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.AdjustmentsLoadOptions,
    ): PowerPoint.Adjustments;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Adjustments;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Adjustments;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Adjustments` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.AdjustmentsData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.AdjustmentsData;
  }
  /**
   * Represents the possible binding types.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  enum BindingType {
    /**
     * Represents a shape binding.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    shape = "Shape",
  }
  /**
   * Represents a custom XML part object.
   *
   * @remarks
   * [Api set: PowerPointApi 1.7]
   */
  export class CustomXmlPart extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * The ID of the custom XML part.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly id: string;
    /**
     * The namespace URI of the custom XML part.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly namespaceUri: string;
    /**
     * Deletes the custom XML part.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    delete(): void;
    /**
     * Gets the XML content of the custom XML part.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    getXml(): OfficeExtension.ClientResult<string>;
    /**
     * Sets the XML content for the custom XML part.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     *
     * @param xml - XML content for the part.
     */
    setXml(xml: string): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.CustomXmlPartLoadOptions,
    ): PowerPoint.CustomXmlPart;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.CustomXmlPart;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.CustomXmlPart;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.CustomXmlPart` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.CustomXmlPartData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.CustomXmlPartData;
  }
  /**
     * A scoped collection of custom XML parts.
                A scoped collection is the result of some operation (such as filtering by namespace).
                A scoped collection cannot be scoped any further.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
  export class CustomXmlPartScopedCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.CustomXmlPart[];
    /**
     * Gets the number of custom XML parts in this collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     * @returns The number of custom XML parts in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a `CustomXmlPart` based on its ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     *
     * @param id - ID of the object to be retrieved.
     */
    getItem(id: string): PowerPoint.CustomXmlPart;
    /**
         * Gets a `CustomXmlPart` by its zero-based index in the collection.
                    Throws an `InvalidArgument` exception when the index is out of range.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         *
         * @param index - The index of the custom XML part in the collection.
         * @returns The custom XML part at the given index.
         */
    getItemAt(index: number): PowerPoint.CustomXmlPart;
    /**
         * Gets a `CustomXmlPart` based on its ID.
                    If the `CustomXmlPart` doesn't exist, then this method returns an object with its `isNullObject` property set to `true`.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.7]
         *
         * @param id - ID of the object to be retrieved.
         */
    getItemOrNullObject(id: string): PowerPoint.CustomXmlPart;
    /**
         * If the collection contains exactly one item, this method returns it.
                    If the collection contains no items or more than one item, then this method returns the `GeneralException` error.
         *
         * @remarks
         * [Api set: PowerPointApi 1.7]
         */
    getOnlyItem(): PowerPoint.CustomXmlPart;
    /**
         * If the collection contains exactly one item, this method returns it.
                    Otherwise, this method returns `null`.
         *
         * @remarks
         * [Api set: PowerPointApi 1.7]
         */
    getOnlyItemOrNullObject(): PowerPoint.CustomXmlPart;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.CustomXmlPartScopedCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.CustomXmlPartScopedCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(
      propertyNames?: string | string[],
    ): PowerPoint.CustomXmlPartScopedCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.CustomXmlPartScopedCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.CustomXmlPartScopedCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.CustomXmlPartScopedCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.CustomXmlPartScopedCollectionData;
  }
  /**
   * A collection of custom XML parts.
   *
   * @remarks
   * [Api set: PowerPointApi 1.7]
   */
  export class CustomXmlPartCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.CustomXmlPart[];
    /**
     * Adds a new `CustomXmlPart` to the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     *
     * @param xml - XML content. Must be a valid XML fragment. If the XML fragment is invalid, then this method returns the `GeneralException` error.
     */
    add(xml: string): PowerPoint.CustomXmlPart;
    /**
     * Gets a new scoped collection of custom XML parts whose namespaces match the given namespace.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     *
     * @param namespaceUri - This must be a fully qualified schema URI, such as "http://schemas.contoso.com/review/1.0".
     */
    getByNamespace(
      namespaceUri: string,
    ): PowerPoint.CustomXmlPartScopedCollection;
    /**
     * Gets the number of custom XML parts in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     * @returns The number of custom XML parts in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a `CustomXmlPart` based on its ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     *
     * @param id - ID of the object to be retrieved.
     */
    getItem(id: string): PowerPoint.CustomXmlPart;
    /**
         * Gets a `CustomXmlPart` by its zero-based index in the collection.
                    Throws an `InvalidArgument` exception when the index is out of range.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         *
         * @param index - The index of the custom XML part in the collection.
         * @returns The custom XML part at the given index.
         */
    getItemAt(index: number): PowerPoint.CustomXmlPart;
    /**
         * Gets a `CustomXmlPart` based on its ID.
                    If the `CustomXmlPart` doesn't exist, then this method returns an object with its `isNullObject` property set to `true`.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.7]
         *
         * @param id - ID of the object to be retrieved.
         */
    getItemOrNullObject(id: string): PowerPoint.CustomXmlPart;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.CustomXmlPartCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.CustomXmlPartCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.CustomXmlPartCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.CustomXmlPartCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.CustomXmlPartCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.CustomXmlPartCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.CustomXmlPartCollectionData;
  }
  /**
   * Represents the available options when adding a {@link PowerPoint.Hyperlink}.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export interface HyperlinkAddOptions {
    /**
     * Specifies the address of the hyperlink, which can be a URL, a file name or file path, or an email address with the `mailto` URI scheme.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    address?: string;
    /**
     * Specifies the string displayed when hovering over the hyperlink.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    screenTip?: string;
  }
  /**
   * Represents a scoped collection of hyperlinks.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class HyperlinkScopedCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.Hyperlink[];
    /**
     * Gets the number of hyperlinks in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     * @returns The number of hyperlinks in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
         * Gets a hyperlink using its zero-based index in the collection.
                    Throws an `InvalidArgument` exception when the index is out of range.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         *
         * @param index - The index of the hyperlink in the collection.
         * @returns The hyperlink at the given index.
         */
    getItemAt(index: number): PowerPoint.Hyperlink;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.HyperlinkScopedCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.HyperlinkScopedCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(
      propertyNames?: string | string[],
    ): PowerPoint.HyperlinkScopedCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.HyperlinkScopedCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.HyperlinkScopedCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.HyperlinkScopedCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.HyperlinkScopedCollectionData;
  }
  /**
   * Represents the horizontal alignment of the {@link PowerPoint.TextFrame} in a {@link PowerPoint.Shape}.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum ParagraphHorizontalAlignment {
    /**
     * Align text to the left margin.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    left = "Left",
    /**
     * Align text in the center.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    center = "Center",
    /**
     * Align text to the right margin.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    right = "Right",
    /**
     * Align text so that it's justified across the whole line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    justify = "Justify",
    /**
     * Specifies the alignment or adjustment of kashida length in Arabic text.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    justifyLow = "JustifyLow",
    /**
     * Distributes the text words across an entire text line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    distributed = "Distributed",
    /**
     * Distributes Thai text specially, because each character is treated as a word.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    thaiDistributed = "ThaiDistributed",
  }
  /**
   * Specifies the style of a bullet.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  enum BulletStyle {
    /**
     * Style is unsupported.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    unsupported = "Unsupported",
    /**
     * Lowercase alphabetical characters with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    alphabetLowercasePeriod = "AlphabetLowercasePeriod",
    /**
     * Uppercase alphabetical characters with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    alphabetUppercasePeriod = "AlphabetUppercasePeriod",
    /**
     * Arabic numerals with closing parenthesis.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    arabicNumeralParenthesisRight = "ArabicNumeralParenthesisRight",
    /**
     * Arabic numerals with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    arabicNumeralPeriod = "ArabicNumeralPeriod",
    /**
     * Lowercase Roman numerals with both parentheses.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    romanLowercaseParenthesesBoth = "RomanLowercaseParenthesesBoth",
    /**
     * Lowercase Roman numerals with closing parenthesis.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    romanLowercaseParenthesisRight = "RomanLowercaseParenthesisRight",
    /**
     * Lowercase Roman numerals with period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    romanLowercasePeriod = "RomanLowercasePeriod",
    /**
     * Uppercase Roman numerals with period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    romanUppercasePeriod = "RomanUppercasePeriod",
    /**
     * Lowercase alphabetical characters with both parentheses.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    alphabetLowercaseParenthesesBoth = "AlphabetLowercaseParenthesesBoth",
    /**
     * Lowercase alphabetical characters with closing parenthesis.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    alphabetLowercaseParenthesisRight = "AlphabetLowercaseParenthesisRight",
    /**
     * Uppercase alphabetical characters with both parentheses.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    alphabetUppercaseParenthesesBoth = "AlphabetUppercaseParenthesesBoth",
    /**
     * Uppercase alphabetical characters with closing parenthesis.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    alphabetUppercaseParenthesisRight = "AlphabetUppercaseParenthesisRight",
    /**
     * Arabic numerals with both parentheses.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    arabicNumeralParenthesesBoth = "ArabicNumeralParenthesesBoth",
    /**
     * Arabic numerals.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    arabicNumeralPlain = "ArabicNumeralPlain",
    /**
     * Uppercase Roman numerals with both parentheses.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    romanUppercaseParenthesesBoth = "RomanUppercaseParenthesesBoth",
    /**
     * Uppercase Roman numerals with closing parenthesis.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    romanUppercaseParenthesisRight = "RomanUppercaseParenthesisRight",
    /**
     * Simplified Chinese without a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    simplifiedChinesePlain = "SimplifiedChinesePlain",
    /**
     * Simplified Chinese with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    simplifiedChinesePeriod = "SimplifiedChinesePeriod",
    /**
     * Double-byte circled number for values up to 10.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    circleNumberDoubleBytePlain = "CircleNumberDoubleBytePlain",
    /**
     * Text colored number with same color circle drawn around it.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    circleNumberWideDoubleByteWhitePlain = "CircleNumberWideDoubleByteWhitePlain",
    /**
     * Shadow color number with circular background of normal text color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    circleNumberWideDoubleByteBlackPlain = "CircleNumberWideDoubleByteBlackPlain",
    /**
     * Traditional Chinese without a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    traditionalChinesePlain = "TraditionalChinesePlain",
    /**
     * Traditional Chinese with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    traditionalChinesePeriod = "TraditionalChinesePeriod",
    /**
     * Arabic alphabet with a dash.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    arabicAlphabetDash = "ArabicAlphabetDash",
    /**
     * Arabic Abjad alphabet with a dash.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    arabicAbjadDash = "ArabicAbjadDash",
    /**
     * Hebrew alphabet with a dash.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    hebrewAlphabetDash = "HebrewAlphabetDash",
    /**
     * Japanese/Korean numbers without a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    kanjiKoreanPlain = "KanjiKoreanPlain",
    /**
     * Japanese/Korean numbers with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    kanjiKoreanPeriod = "KanjiKoreanPeriod",
    /**
     * Double-byte Arabic numbering scheme (no punctuation).
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    arabicDoubleBytePlain = "ArabicDoubleBytePlain",
    /**
     * Double-byte Arabic numbering scheme with double-byte period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    arabicDoubleBytePeriod = "ArabicDoubleBytePeriod",
    /**
     * Thai alphabet with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    thaiAlphabetPeriod = "ThaiAlphabetPeriod",
    /**
     * Thai alphabet with closing parenthesis.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    thaiAlphabetParenthesisRight = "ThaiAlphabetParenthesisRight",
    /**
     * Thai alphabet with both parentheses.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    thaiAlphabetParenthesesBoth = "ThaiAlphabetParenthesesBoth",
    /**
     * Thai numerals with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    thaiNumeralPeriod = "ThaiNumeralPeriod",
    /**
     * Thai numerals with closing parenthesis.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    thaiNumeralParenthesisRight = "ThaiNumeralParenthesisRight",
    /**
     * Thai numerals with both parentheses.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    thaiNumeralParenthesesBoth = "ThaiNumeralParenthesesBoth",
    /**
     * Hindi alphabet (vowels) with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    hindiAlphabetPeriod = "HindiAlphabetPeriod",
    /**
     * Hindi numerals with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    hindiNumeralPeriod = "HindiNumeralPeriod",
    /**
     * Kanji Simplified Chinese with double-byte period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    kanjiSimplifiedChineseDoubleBytePeriod = "KanjiSimplifiedChineseDoubleBytePeriod",
    /**
     * Hindi numerals with closing parenthesis.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    hindiNumeralParenthesisRight = "HindiNumeralParenthesisRight",
    /**
     * Hindi alphabet (consonants) with a period.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    hindiAlphabet1Period = "HindiAlphabet1Period",
  }
  /**
   * Specifies the type of a bullet.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  enum BulletType {
    /**
     * Type is unsupported.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    unsupported = "Unsupported",
    /**
     * No bullets.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    none = "None",
    /**
     * Numbered bullet (e.g., 1, 2, 3 or a, b, c).
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    numbered = "Numbered",
    /**
     * Symbol-based bullet (e.g., disc, circle, square).
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    unnumbered = "Unnumbered",
  }
  /**
   * Represents the bullet formatting properties of a text that is attached to the {@link PowerPoint.ParagraphFormat}.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  export class BulletFormat extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
         * Specifies the style of the bullets in the paragraph. See {@link PowerPoint.BulletStyle} for details.
                    Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet formatting properties.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    style:
      | PowerPoint.BulletStyle
      | "Unsupported"
      | "AlphabetLowercasePeriod"
      | "AlphabetUppercasePeriod"
      | "ArabicNumeralParenthesisRight"
      | "ArabicNumeralPeriod"
      | "RomanLowercaseParenthesesBoth"
      | "RomanLowercaseParenthesisRight"
      | "RomanLowercasePeriod"
      | "RomanUppercasePeriod"
      | "AlphabetLowercaseParenthesesBoth"
      | "AlphabetLowercaseParenthesisRight"
      | "AlphabetUppercaseParenthesesBoth"
      | "AlphabetUppercaseParenthesisRight"
      | "ArabicNumeralParenthesesBoth"
      | "ArabicNumeralPlain"
      | "RomanUppercaseParenthesesBoth"
      | "RomanUppercaseParenthesisRight"
      | "SimplifiedChinesePlain"
      | "SimplifiedChinesePeriod"
      | "CircleNumberDoubleBytePlain"
      | "CircleNumberWideDoubleByteWhitePlain"
      | "CircleNumberWideDoubleByteBlackPlain"
      | "TraditionalChinesePlain"
      | "TraditionalChinesePeriod"
      | "ArabicAlphabetDash"
      | "ArabicAbjadDash"
      | "HebrewAlphabetDash"
      | "KanjiKoreanPlain"
      | "KanjiKoreanPeriod"
      | "ArabicDoubleBytePlain"
      | "ArabicDoubleBytePeriod"
      | "ThaiAlphabetPeriod"
      | "ThaiAlphabetParenthesisRight"
      | "ThaiAlphabetParenthesesBoth"
      | "ThaiNumeralPeriod"
      | "ThaiNumeralParenthesisRight"
      | "ThaiNumeralParenthesesBoth"
      | "HindiAlphabetPeriod"
      | "HindiNumeralPeriod"
      | "KanjiSimplifiedChineseDoubleBytePeriod"
      | "HindiNumeralParenthesisRight"
      | "HindiAlphabet1Period"
      | null;
    /**
         * Specifies the type of the bullets in the paragraph. See {@link PowerPoint.BulletType} for details.
                    Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet formatting properties.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    type:
      | PowerPoint.BulletType
      | "Unsupported"
      | "None"
      | "Numbered"
      | "Unnumbered"
      | null;
    /**
     * Specifies if the bullets in the paragraph are visible. Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet visibility values.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    visible: boolean | null;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.BulletFormatLoadOptions,
    ): PowerPoint.BulletFormat;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.BulletFormat;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.BulletFormat;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.BulletFormat` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.BulletFormatData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.BulletFormatData;
  }
  /**
   * Represents the paragraph formatting properties of a text that is attached to the {@link PowerPoint.TextRange}.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  export class ParagraphFormat extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Represents the bullet format of the paragraph. See {@link PowerPoint.BulletFormat} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly bulletFormat: PowerPoint.BulletFormat;
    /**
     * Represents the horizontal alignment of the paragraph. Returns 'null' if the 'TextRange' includes text fragments with different horizontal alignment values. See {@link PowerPoint.ParagraphHorizontalAlignment} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    horizontalAlignment:
      | PowerPoint.ParagraphHorizontalAlignment
      | "Left"
      | "Center"
      | "Right"
      | "Justify"
      | "JustifyLow"
      | "Distributed"
      | "ThaiDistributed"
      | null;
    /**
     * Represents the indent level of the paragraph.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    indentLevel: number;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.ParagraphFormatLoadOptions,
    ): PowerPoint.ParagraphFormat;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.ParagraphFormat;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.ParagraphFormat;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.ParagraphFormat` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ParagraphFormatData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.ParagraphFormatData;
  }
  /**
   * The type of underline applied to a font.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum ShapeFontUnderlineStyle {
    /**
     * No underlining.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    none = "None",
    /**
     * Regular single line underlining.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    single = "Single",
    /**
     * Underlining of text with double lines.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    double = "Double",
    /**
     * Underlining of text with a thick line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    heavy = "Heavy",
    /**
     * Underlining of text with a dotted line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dotted = "Dotted",
    /**
     * Underlining of text with a thick, dotted line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dottedHeavy = "DottedHeavy",
    /**
     * Underlining of text with a line containing dashes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dash = "Dash",
    /**
     * Underlining of text with a thick line containing dashes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dashHeavy = "DashHeavy",
    /**
     * Underlining of text with a line containing long dashes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dashLong = "DashLong",
    /**
     * Underlining of text with a thick line containing long dashes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dashLongHeavy = "DashLongHeavy",
    /**
     * Underlining of text with a line containing dots and dashes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dotDash = "DotDash",
    /**
     * Underlining of text with a thick line containing dots and dashes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dotDashHeavy = "DotDashHeavy",
    /**
     * Underlining of text with a line containing double dots and dashes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dotDotDash = "DotDotDash",
    /**
     * Underlining of text with a thick line containing double dots and dashes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dotDotDashHeavy = "DotDotDashHeavy",
    /**
     * Underlining of text with a wavy line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    wavy = "Wavy",
    /**
     * Underlining of text with a thick, wavy line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    wavyHeavy = "WavyHeavy",
    /**
     * Underlining of text with double wavy lines.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    wavyDouble = "WavyDouble",
  }
  /**
   * Represents the font attributes, such as font name, font size, and color, for a shape's TextRange object.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  export class ShapeFont extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
         * Specifies whether the text in the `TextRange` is set to use the **All Caps** attribute which makes lowercase letters appear as uppercase letters. The possible values are as follows:
                    
                    - `true`: All the text has the **All Caps** attribute.
                    
                    - `false`: None of the text has the **All Caps** attribute.
                    
                    - `null`: Returned if some, but not all, of the text has the **All Caps** attribute.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    allCaps: boolean | null;
    /**
         * Specifies whether the text in the `TextRange` is set to bold. The possible values are as follows:
                    
                    - `true`: All the text is bold.
                    
                    - `false`: None of the text is bold.
                    
                    - `null`: Returned if some, but not all, of the text is bold.
         *
         * @remarks
         * [Api set: PowerPointApi 1.4]
         */
    bold: boolean | null;
    /**
     * Specifies the HTML color code representation of the text color (e.g., "#FF0000" represents red). Returns `null` if the `TextRange` contains text fragments with different colors.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    color: string | null;
    /**
         * Specifies whether the text in the `TextRange` is set to use the **Double strikethrough** attribute. The possible values are as follows:
                    
                    - `true`: All the text has the **Double strikethrough** attribute.
                    
                    - `false`: None of the text has the **Double strikethrough** attribute.
                    
                    - `null`: Returned if some, but not all, of the text has the **Double strikethrough** attribute.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    doubleStrikethrough: boolean | null;
    /**
         * Specifies whether the text in the `TextRange` is set to italic. The possible values are as follows:
                    
                    - `true`: All the text is italicized.
                    
                    - `false`: None of the text is italicized.
                    
                    - `null`: Returned if some, but not all, of the text is italicized.
         *
         * @remarks
         * [Api set: PowerPointApi 1.4]
         */
    italic: boolean | null;
    /**
     * Specifies the font name (e.g., "Calibri"). If the text is a Complex Script or East Asian language, this is the corresponding font name; otherwise it's the Latin font name. Returns `null` if the `TextRange` contains text fragments with different font names.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    name: string | null;
    /**
     * Specifies the font size in points (e.g., 11). Returns `null` if the `TextRange` contains text fragments with different font sizes.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    size: number | null;
    /**
         * Specifies whether the text in the `TextRange` is set to use the **Small Caps** attribute which makes lowercase letters appear as small uppercase letters. The possible values are as follows:
                    
                    - `true`: All the text has the **Small Caps** attribute.
                    
                    - `false`: None of the text has the **Small Caps** attribute.
                    
                    - `null`: Returned if some, but not all, of the text has the **Small Caps** attribute.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    smallCaps: boolean | null;
    /**
         * Specifies whether the text in the `TextRange` is set to use the **Strikethrough** attribute. The possible values are as follows:
                    
                    - `true`: All the text has the **Strikethrough** attribute.
                    
                    - `false`: None of the text has the **Strikethrough** attribute.
                    
                    - `null`: Returned if some, but not all, of the text has the **Strikethrough** attribute.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    strikethrough: boolean | null;
    /**
         * Specifies whether the text in the `TextRange` is set to use the **Subscript** attribute. The possible values are as follows:
                    
                    - `true`: All the text has the **Subscript** attribute.
                    
                    - `false`: None of the text has the **Subscript** attribute.
                    
                    - `null`: Returned if some, but not all, of the text has the **Subscript** attribute.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    subscript: boolean | null;
    /**
         * Specifies whether the text in the `TextRange` is set to use the **Superscript** attribute. The possible values are as follows:
                    
                    - `true`: All the text has the **Superscript** attribute.
                    
                    - `false`: None of the text has the **Superscript** attribute.
                    
                    - `null`: Returned if some, but not all, of the text has the **Superscript** attribute.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    superscript: boolean | null;
    /**
     * Specifies the type of underline applied to the font. Returns `null` if the `TextRange` contains text fragments with different underline styles. See {@link PowerPoint.ShapeFontUnderlineStyle} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    underline:
      | PowerPoint.ShapeFontUnderlineStyle
      | "None"
      | "Single"
      | "Double"
      | "Heavy"
      | "Dotted"
      | "DottedHeavy"
      | "Dash"
      | "DashHeavy"
      | "DashLong"
      | "DashLongHeavy"
      | "DotDash"
      | "DotDashHeavy"
      | "DotDotDash"
      | "DotDotDashHeavy"
      | "Wavy"
      | "WavyHeavy"
      | "WavyDouble"
      | null;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.ShapeFontLoadOptions,
    ): PowerPoint.ShapeFont;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.ShapeFont;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.ShapeFont;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.ShapeFont` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ShapeFontData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.ShapeFontData;
  }
  /**
   * Determines the type of automatic sizing allowed.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum ShapeAutoSize {
    /**
     * No autosizing.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    autoSizeNone = "AutoSizeNone",
    /**
     * The text is adjusted to fit the shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    autoSizeTextToFitShape = "AutoSizeTextToFitShape",
    /**
     * The shape is adjusted to fit the text.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    autoSizeShapeToFitText = "AutoSizeShapeToFitText",
    /**
     * A combination of automatic sizing schemes are used.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    autoSizeMixed = "AutoSizeMixed",
  }
  /**
     * Represents the vertical alignment of a {@link PowerPoint.TextFrame} in a {@link PowerPoint.Shape}.
                If one of the centered options is selected, the contents of the `TextFrame` will be centered horizontally within the `Shape` as a group.
                To change the horizontal alignment of a text, see {@link PowerPoint.ParagraphFormat} and {@link PowerPoint.ParagraphHorizontalAlignment}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
  enum TextVerticalAlignment {
    /**
     * Specifies that the `TextFrame` should be top aligned to the `Shape`.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    top = "Top",
    /**
     * Specifies that the `TextFrame` should be center aligned to the `Shape`.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    middle = "Middle",
    /**
     * Specifies that the `TextFrame` should be bottom aligned to the `Shape`.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    bottom = "Bottom",
    /**
     * Specifies that the `TextFrame` should be top aligned vertically to the `Shape`. Contents of the `TextFrame` will be centered horizontally within the `Shape`.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    topCentered = "TopCentered",
    /**
     * Specifies that the `TextFrame` should be center aligned vertically to the `Shape`. Contents of the `TextFrame` will be centered horizontally within the `Shape`.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    middleCentered = "MiddleCentered",
    /**
     * Specifies that the `TextFrame` should be bottom aligned vertically to the `Shape`. Contents of the `TextFrame` will be centered horizontally within the `Shape`.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    bottomCentered = "BottomCentered",
  }
  /**
   * Represents the text frame of a shape object.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  export class TextFrame extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Represents the text that is attached to a shape in the text frame, and properties and methods for manipulating the text. See {@link PowerPoint.TextRange} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly textRange: PowerPoint.TextRange;
    /**
     * The automatic sizing settings for the text frame. A text frame can be set to automatically fit the text to the text frame, to automatically fit the text frame to the text, or not perform any automatic sizing.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    autoSizeSetting:
      | PowerPoint.ShapeAutoSize
      | "AutoSizeNone"
      | "AutoSizeTextToFitShape"
      | "AutoSizeShapeToFitText"
      | "AutoSizeMixed";
    /**
     * Represents the bottom margin, in points, of the text frame.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    bottomMargin: number;
    /**
     * Specifies if the text frame contains text.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly hasText: boolean;
    /**
     * Represents the left margin, in points, of the text frame.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftMargin: number;
    /**
     * Represents the right margin, in points, of the text frame.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    rightMargin: number;
    /**
     * Represents the top margin, in points, of the text frame.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    topMargin: number;
    /**
     * Represents the vertical alignment of the text frame. See {@link PowerPoint.TextVerticalAlignment} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    verticalAlignment:
      | PowerPoint.TextVerticalAlignment
      | "Top"
      | "Middle"
      | "Bottom"
      | "TopCentered"
      | "MiddleCentered"
      | "BottomCentered";
    /**
     * Determines whether lines break automatically to fit text inside the shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    wordWrap: boolean;
    /**
     * Deletes all the text in the text frame.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    deleteText(): void;
    /**
     * Returns the parent {@link PowerPoint.Shape} object that holds this `TextFrame`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    getParentShape(): PowerPoint.Shape;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TextFrameLoadOptions,
    ): PowerPoint.TextFrame;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TextFrame;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.TextFrame;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TextFrame` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TextFrameData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.TextFrameData;
  }
  /**
   * Contains the text that is attached to a shape, in addition to properties and methods for manipulating the text.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  export class TextRange extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns a `ShapeFont` object that represents the font attributes for the text range.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly font: PowerPoint.ShapeFont;
    /**
     * Returns a collection of hyperlinks that exist on this `TextRange`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly hyperlinks: PowerPoint.HyperlinkScopedCollection;
    /**
     * Represents the paragraph format of the text range. See {@link PowerPoint.ParagraphFormat} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly paragraphFormat: PowerPoint.ParagraphFormat;
    /**
         * Gets or sets the length of the range that this `TextRange` represents.
                    Throws an `InvalidArgument` exception when set with a negative value or if the value is greater than the length of the available text from the starting point.
         *
         * @remarks
         * [Api set: PowerPointApi 1.5]
         */
    length: number;
    /**
         * Gets or sets zero-based index, relative to the parent text frame, for the starting position of the range that this `TextRange` represents.
                    Throws an `InvalidArgument` exception when set with a negative value or if the value is greater than the length of the text.
         *
         * @remarks
         * [Api set: PowerPointApi 1.5]
         */
    start: number;
    /**
     * Represents the plain text content of the text range.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    text: string;
    /**
     * Returns the parent {@link PowerPoint.TextFrame} object that holds this `TextRange`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    getParentTextFrame(): PowerPoint.TextFrame;
    /**
     * Returns a `TextRange` object for the substring in the given range.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     *
     * @param start - The zero-based index of the first character to get from the text range.
     * @param length - Optional. The number of characters to be returned in the new text range. If length is omitted, all the characters from start to the end of the text range's last paragraph will be returned.
     */
    getSubstring(start: number, length?: number): PowerPoint.TextRange;
    /**
     * Sets a hyperlink on this `TextRange` with the specified options. This will delete all existing hyperlinks on this `TextRange`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param options - Optional. The options for the hyperlink.
     * @returns The newly created {@link PowerPoint.Hyperlink} object.
     */
    setHyperlink(
      options?: PowerPoint.HyperlinkAddOptions,
    ): PowerPoint.Hyperlink;
    /**
     * Selects this `TextRange` in the current view.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    setSelected(): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TextRangeLoadOptions,
    ): PowerPoint.TextRange;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TextRange;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.TextRange;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TextRange` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TextRangeData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.TextRangeData;
  }
  /**
   * Specifies the type of object that a hyperlink is applied to.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  enum HyperlinkType {
    /**
     * Specifies that the hyperlink is applied to a TextRange.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    textRange = "TextRange",
    /**
     * Specifies that the hyperlink is applied to a Shape.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    shape = "Shape",
  }
  /**
   * Represents a single hyperlink.
   *
   * @remarks
   * [Api set: PowerPointApi 1.6]
   */
  export class Hyperlink extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies the address of the hyperlink, which can be a URL, a file name or file path, or an email address with the `mailto` URI scheme.
     *
     * @remarks
     * [Api set: PowerPointApi 1.6]
     */
    address: string;
    /**
     * Specifies the string displayed when hovering over the hyperlink.
     *
     * @remarks
     * [Api set: PowerPointApi 1.6]
     */
    screenTip: string;
    /**
     * Returns the type of object that the hyperlink is applied to. See {@link PowerPoint.HyperlinkType} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly type: PowerPoint.HyperlinkType | "TextRange" | "Shape";
    /**
     * Deletes the hyperlink.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    delete(): void;
    /**
         * Returns the {@link PowerPoint.Shape} object that the hyperlink is applied to.
                    If the hyperlink is not of type `shape`, or it is within a domain that does not currently support a {@link PowerPoint.Shape}, then this method returns an object with its `isNullObject` property set to `true`.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    getLinkedShapeOrNullObject(): PowerPoint.Shape;
    /**
         * Returns the {@link PowerPoint.TextRange} object that the hyperlink is applied to.
                    If the hyperlink is not of type `textRange`, or it is within a domain that does not currently support a {@link PowerPoint.TextRange}, then this method returns an object with its `isNullObject` property set to `true`.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    getLinkedTextRangeOrNullObject(): PowerPoint.TextRange;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.HyperlinkLoadOptions,
    ): PowerPoint.Hyperlink;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Hyperlink;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Hyperlink;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Hyperlink` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.HyperlinkData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.HyperlinkData;
  }
  /**
   * Specifies the type of a placeholder.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  enum PlaceholderType {
    /**
     * The placeholder is unsupported.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    unsupported = "Unsupported",
    /**
     * The placeholder is for a date.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    date = "Date",
    /**
     * The placeholder is for a slide number.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    slideNumber = "SlideNumber",
    /**
     * The placeholder is for a footer.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    footer = "Footer",
    /**
     * The placeholder is for a header.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    header = "Header",
    /**
     * The placeholder is for a title.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    title = "Title",
    /**
     * The placeholder is for a body.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    body = "Body",
    /**
     * The placeholder is for a center title.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    centerTitle = "CenterTitle",
    /**
     * The placeholder is for a subtitle.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    subtitle = "Subtitle",
    /**
     * The placeholder is for a vertical title.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    verticalTitle = "VerticalTitle",
    /**
     * The placeholder is for a vertical body.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    verticalBody = "VerticalBody",
    /**
     * The placeholder is for generic content.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    content = "Content",
    /**
     * The placeholder is for a chart.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    chart = "Chart",
    /**
     * The placeholder is for a table.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    table = "Table",
    /**
     * The placeholder is for an online picture.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    onlinePicture = "OnlinePicture",
    /**
     * The placeholder is for a SmartArt.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    smartArt = "SmartArt",
    /**
     * The placeholder is for media.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    media = "Media",
    /**
     * The placeholder is for generic vertical content.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    verticalContent = "VerticalContent",
    /**
     * The placeholder is for a picture.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    picture = "Picture",
    /**
     * The placeholder is for a cameo.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    cameo = "Cameo",
  }
  /**
   * Specifies the type of a shape.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum ShapeType {
    /**
     * The given shape's type is unsupported.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    unsupported = "Unsupported",
    /**
     * The shape is an image.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    image = "Image",
    /**
     * The shape is a geometric shape such as rectangle.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    geometricShape = "GeometricShape",
    /**
     * The shape is a group shape which contains sub-shapes.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    group = "Group",
    /**
     * The shape is a line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    line = "Line",
    /**
     * The shape is a table.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    table = "Table",
    /**
     * The shape is a callout.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    callout = "Callout",
    /**
     * The shape is a chart.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    chart = "Chart",
    /**
     * The shape is a content Office Add-in.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    contentApp = "ContentApp",
    /**
     * The shape is a diagram.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    diagram = "Diagram",
    /**
     * The shape is a freeform object.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    freeform = "Freeform",
    /**
     * The shape is a graphic.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    graphic = "Graphic",
    /**
     * The shape is an ink object.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    ink = "Ink",
    /**
     * The shape is a media object.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    media = "Media",
    /**
     * The shape is a 3D model.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    model3D = "Model3D",
    /**
     * The shape is an OLE (Object Linking and Embedding) object.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    ole = "Ole",
    /**
     * The shape is a placeholder.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    placeholder = "Placeholder",
    /**
     * The shape is a SmartArt graphic.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    smartArt = "SmartArt",
    /**
     * The shape is a text box.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    textBox = "TextBox",
  }
  /**
   * Represents the properties of a `placeholder` shape.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export class PlaceholderFormat extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
         * Gets the type of the shape contained within the placeholder. See {@link PowerPoint.ShapeType} for details.
                    Returns `null` if the placeholder is empty.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    readonly containedType:
      | PowerPoint.ShapeType
      | "Unsupported"
      | "Image"
      | "GeometricShape"
      | "Group"
      | "Line"
      | "Table"
      | "Callout"
      | "Chart"
      | "ContentApp"
      | "Diagram"
      | "Freeform"
      | "Graphic"
      | "Ink"
      | "Media"
      | "Model3D"
      | "Ole"
      | "Placeholder"
      | "SmartArt"
      | "TextBox"
      | null;
    /**
     * Returns the type of this placeholder. See {@link PowerPoint.PlaceholderType} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly type:
      | PowerPoint.PlaceholderType
      | "Unsupported"
      | "Date"
      | "SlideNumber"
      | "Footer"
      | "Header"
      | "Title"
      | "Body"
      | "CenterTitle"
      | "Subtitle"
      | "VerticalTitle"
      | "VerticalBody"
      | "Content"
      | "Chart"
      | "Table"
      | "OnlinePicture"
      | "SmartArt"
      | "Media"
      | "VerticalContent"
      | "Picture"
      | "Cameo";
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.PlaceholderFormatLoadOptions,
    ): PowerPoint.PlaceholderFormat;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.PlaceholderFormat;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.PlaceholderFormat;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.PlaceholderFormat` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.PlaceholderFormatData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.PlaceholderFormatData;
  }
  /**
   * Represents a collection of hyperlinks.
   *
   * @remarks
   * [Api set: PowerPointApi 1.6]
   */
  export class HyperlinkCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.Hyperlink[];
    /**
         * Adds a hyperlink to the specified target with the given options. If the target already contains any hyperlinks, they will be deleted.
                    The new hyperlink may appear anywhere in the collection and is not guaranteed to be added at the end.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         *
         * @param target - The target to add the hyperlink to. Can be a {@link PowerPoint.TextRange} or a {@link PowerPoint.Shape}.
         * @param options - Optional. The options for the hyperlink.
         * @returns The newly created {@link PowerPoint.Hyperlink} object.
         */
    add(
      target: TextRange | Shape,
      options?: PowerPoint.HyperlinkAddOptions,
    ): PowerPoint.Hyperlink;
    /**
     * Gets the number of hyperlinks in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.6]
     * @returns The number of hyperlinks in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
         * Gets a hyperlink using its zero-based index in the collection.
                    Throws an `InvalidArgument` exception if the index is out of range.
         *
         * @remarks
         * [Api set: PowerPointApi 1.6]
         *
         * @param index - The index of the hyperlink in the collection.
         * @returns The hyperlink at the given index.
         */
    getItemAt(index: number): PowerPoint.Hyperlink;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.HyperlinkCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.HyperlinkCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.HyperlinkCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.HyperlinkCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.HyperlinkCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.HyperlinkCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.HyperlinkCollectionData;
  }
  /**
   * Specifies the connector type for line shapes.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum ConnectorType {
    /**
     * Straight connector type.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    straight = "Straight",
    /**
     * Elbow connector type.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    elbow = "Elbow",
    /**
     * Curve connector type.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    curve = "Curve",
  }
  /**
   * Specifies the shape type for a `GeometricShape` object.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum GeometricShapeType {
    /**
     * Straight line from top-right corner to bottom-left corner of the shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    lineInverse = "LineInverse",
    /**
     * Isosceles triangle geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    triangle = "Triangle",
    /**
     * Right triangle geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    rightTriangle = "RightTriangle",
    /**
     * Rectangle geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    rectangle = "Rectangle",
    /**
     * Diamond geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    diamond = "Diamond",
    /**
     * Parallelogram geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    parallelogram = "Parallelogram",
    /**
     * Trapezoid geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    trapezoid = "Trapezoid",
    /**
     * Trapezoid geometric shape which may have non-equal sides.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    nonIsoscelesTrapezoid = "NonIsoscelesTrapezoid",
    /**
     * Pentagon geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    pentagon = "Pentagon",
    /**
     * Hexagon geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    hexagon = "Hexagon",
    /**
     * Heptagon geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    heptagon = "Heptagon",
    /**
     * Octagon geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    octagon = "Octagon",
    /**
     * Decagon geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    decagon = "Decagon",
    /**
     * Dodecagon geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dodecagon = "Dodecagon",
    /**
     * Star: 4 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star4 = "Star4",
    /**
     * Star: 5 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star5 = "Star5",
    /**
     * Star: 6 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star6 = "Star6",
    /**
     * Star: 7 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star7 = "Star7",
    /**
     * Star: 8 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star8 = "Star8",
    /**
     * Star: 10 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star10 = "Star10",
    /**
     * Star: 12 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star12 = "Star12",
    /**
     * Star: 16 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star16 = "Star16",
    /**
     * Star: 24 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star24 = "Star24",
    /**
     * Star: 32 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    star32 = "Star32",
    /**
     * Rectangle geometric shape: rounded corners.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    roundRectangle = "RoundRectangle",
    /**
     * Rectangle geometric shape: single corner rounded.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    round1Rectangle = "Round1Rectangle",
    /**
     * Rectangle geometric shape: top corners rounded.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    round2SameRectangle = "Round2SameRectangle",
    /**
     * Rectangle geometric shape: diagonal corners rounded.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    round2DiagonalRectangle = "Round2DiagonalRectangle",
    /**
     * Rectangle geometric shape: top corners one rounded and one snipped.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    snipRoundRectangle = "SnipRoundRectangle",
    /**
     * Rectangle geometric shape: single corner snipped.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    snip1Rectangle = "Snip1Rectangle",
    /**
     * Rectangle geometric shape: top corners snipped.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    snip2SameRectangle = "Snip2SameRectangle",
    /**
     * Rectangle geometric shape: diagonal corners snipped.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    snip2DiagonalRectangle = "Snip2DiagonalRectangle",
    /**
     * Plaque geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    plaque = "Plaque",
    /**
     * Oval geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    ellipse = "Ellipse",
    /**
     * Teardrop geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    teardrop = "Teardrop",
    /**
     * Arrow: pentagon.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    homePlate = "HomePlate",
    /**
     * Arrow: chevron.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    chevron = "Chevron",
    /**
     * Partial circle geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    pieWedge = "PieWedge",
    /**
     * Partial circle geometric shape with adjustable spanning area.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    pie = "Pie",
    /**
     * Block arc geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    blockArc = "BlockArc",
    /**
     * Circle geometric shape: hollow.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    donut = "Donut",
    /**
     * "Not allowed" symbol.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    noSmoking = "NoSmoking",
    /**
     * Arrow: right.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    rightArrow = "RightArrow",
    /**
     * Arrow: left.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftArrow = "LeftArrow",
    /**
     * Arrow: up.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    upArrow = "UpArrow",
    /**
     * Arrow: down.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    downArrow = "DownArrow",
    /**
     * Arrow: striped right.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    stripedRightArrow = "StripedRightArrow",
    /**
     * Arrow: notched right.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    notchedRightArrow = "NotchedRightArrow",
    /**
     * Arrow: bent-up.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    bentUpArrow = "BentUpArrow",
    /**
     * Arrow: left-right.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftRightArrow = "LeftRightArrow",
    /**
     * Arrow: up-down.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    upDownArrow = "UpDownArrow",
    /**
     * Arrow: left-up.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftUpArrow = "LeftUpArrow",
    /**
     * Arrow: left-right-up.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftRightUpArrow = "LeftRightUpArrow",
    /**
     * Arrow: quad.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    quadArrow = "QuadArrow",
    /**
     * Callout: left arrow.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftArrowCallout = "LeftArrowCallout",
    /**
     * Callout: right arrow.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    rightArrowCallout = "RightArrowCallout",
    /**
     * Callout: up arrow.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    upArrowCallout = "UpArrowCallout",
    /**
     * Callout: down arrow.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    downArrowCallout = "DownArrowCallout",
    /**
     * Callout: left-right arrow.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftRightArrowCallout = "LeftRightArrowCallout",
    /**
     * Callout: up-down arrow.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    upDownArrowCallout = "UpDownArrowCallout",
    /**
     * Callout: quad arrow.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    quadArrowCallout = "QuadArrowCallout",
    /**
     * Arrow: bent.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    bentArrow = "BentArrow",
    /**
     * Arrow: U-turn.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    uturnArrow = "UturnArrow",
    /**
     * Arrow: circular.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    circularArrow = "CircularArrow",
    /**
     * Arrow: circular with opposite arrow direction.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftCircularArrow = "LeftCircularArrow",
    /**
     * Arrow: circular with two arrows in both directions.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftRightCircularArrow = "LeftRightCircularArrow",
    /**
     * Arrow: curved right.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    curvedRightArrow = "CurvedRightArrow",
    /**
     * Arrow: curved left.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    curvedLeftArrow = "CurvedLeftArrow",
    /**
     * Arrow: curved up.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    curvedUpArrow = "CurvedUpArrow",
    /**
     * Arrow: curved down.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    curvedDownArrow = "CurvedDownArrow",
    /**
     * Arrow: curved right arrow with varying width.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    swooshArrow = "SwooshArrow",
    /**
     * Cube geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    cube = "Cube",
    /**
     * Cylinder geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    can = "Can",
    /**
     * Lightning bolt.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    lightningBolt = "LightningBolt",
    /**
     * Heart geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    heart = "Heart",
    /**
     * Sun.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    sun = "Sun",
    /**
     * Moon geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    moon = "Moon",
    /**
     * Smiley face.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    smileyFace = "SmileyFace",
    /**
     * Explosion: 8 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    irregularSeal1 = "IrregularSeal1",
    /**
     * Explosion: 14 points.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    irregularSeal2 = "IrregularSeal2",
    /**
     * Rectangle geometric shape: folded corner.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    foldedCorner = "FoldedCorner",
    /**
     * Rectangle geometric shape: beveled.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    bevel = "Bevel",
    /**
     * Frame geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    frame = "Frame",
    /**
     * Half frame geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    halfFrame = "HalfFrame",
    /**
     * L-shape geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    corner = "Corner",
    /**
     * Diagonal stripe geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    diagonalStripe = "DiagonalStripe",
    /**
     * Chord geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    chord = "Chord",
    /**
     * Arc geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    arc = "Arc",
    /**
     * Left bracket.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftBracket = "LeftBracket",
    /**
     * Right bracket.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    rightBracket = "RightBracket",
    /**
     * Left brace.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftBrace = "LeftBrace",
    /**
     * Right brace.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    rightBrace = "RightBrace",
    /**
     * Double bracket.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    bracketPair = "BracketPair",
    /**
     * Double brace.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    bracePair = "BracePair",
    /**
     * Callout: line with no border.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    callout1 = "Callout1",
    /**
     * Callout: bent line with no border.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    callout2 = "Callout2",
    /**
     * Callout: double bent line with no border.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    callout3 = "Callout3",
    /**
     * Callout: line with accent bar.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    accentCallout1 = "AccentCallout1",
    /**
     * Callout: bent line with accent bar.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    accentCallout2 = "AccentCallout2",
    /**
     * Callout: double bent line with accent bar.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    accentCallout3 = "AccentCallout3",
    /**
     * Callout: line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    borderCallout1 = "BorderCallout1",
    /**
     * Callout: bent line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    borderCallout2 = "BorderCallout2",
    /**
     * Callout: double bent line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    borderCallout3 = "BorderCallout3",
    /**
     * Callout: line with border and accent bar.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    accentBorderCallout1 = "AccentBorderCallout1",
    /**
     * Callout: bent line with border and accent bar.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    accentBorderCallout2 = "AccentBorderCallout2",
    /**
     * Callout: double bent line with border and accent bar.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    accentBorderCallout3 = "AccentBorderCallout3",
    /**
     * Speech bubble: rectangle.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    wedgeRectCallout = "WedgeRectCallout",
    /**
     * Speech bubble: rectangle with corners rounded.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    wedgeRRectCallout = "WedgeRRectCallout",
    /**
     * Speech bubble: oval.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    wedgeEllipseCallout = "WedgeEllipseCallout",
    /**
     * Thought bubble: cloud.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    cloudCallout = "CloudCallout",
    /**
     * Cloud.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    cloud = "Cloud",
    /**
     * Ribbon: tilted down.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    ribbon = "Ribbon",
    /**
     * Ribbon: tilted up.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    ribbon2 = "Ribbon2",
    /**
     * Ribbon: curved and tilted down.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    ellipseRibbon = "EllipseRibbon",
    /**
     * Ribbon: curved and tilted up.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    ellipseRibbon2 = "EllipseRibbon2",
    /**
     * Ribbon: straight with both left and right arrows.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    leftRightRibbon = "LeftRightRibbon",
    /**
     * Scroll: vertical.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    verticalScroll = "VerticalScroll",
    /**
     * Scroll: horizontal.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    horizontalScroll = "HorizontalScroll",
    /**
     * Wave geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    wave = "Wave",
    /**
     * Double wave geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    doubleWave = "DoubleWave",
    /**
     * Cross geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    plus = "Plus",
    /**
     * Flowchart: process.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartProcess = "FlowChartProcess",
    /**
     * Flowchart: decision.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartDecision = "FlowChartDecision",
    /**
     * Flowchart: data.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartInputOutput = "FlowChartInputOutput",
    /**
     * Flowchart: predefined process.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartPredefinedProcess = "FlowChartPredefinedProcess",
    /**
     * Flowchart: internal storage.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartInternalStorage = "FlowChartInternalStorage",
    /**
     * Flowchart: document.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartDocument = "FlowChartDocument",
    /**
     * Flowchart: multidocument.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartMultidocument = "FlowChartMultidocument",
    /**
     * Flowchart: terminator.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartTerminator = "FlowChartTerminator",
    /**
     * Flowchart: preparation.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartPreparation = "FlowChartPreparation",
    /**
     * Flowchart: manual input.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartManualInput = "FlowChartManualInput",
    /**
     * Flowchart: manual operation.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartManualOperation = "FlowChartManualOperation",
    /**
     * Flowchart: connector.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartConnector = "FlowChartConnector",
    /**
     * Flowchart: card.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartPunchedCard = "FlowChartPunchedCard",
    /**
     * Flowchart: punched tape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartPunchedTape = "FlowChartPunchedTape",
    /**
     * Flowchart: summing junction.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartSummingJunction = "FlowChartSummingJunction",
    /**
     * Flowchart: or.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartOr = "FlowChartOr",
    /**
     * Flowchart: collate.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartCollate = "FlowChartCollate",
    /**
     * Flowchart: sort.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartSort = "FlowChartSort",
    /**
     * Flowchart: extract.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartExtract = "FlowChartExtract",
    /**
     * Flowchart: merge.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartMerge = "FlowChartMerge",
    /**
     * Flowchart: offline storage.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartOfflineStorage = "FlowChartOfflineStorage",
    /**
     * Flowchart: stored data.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartOnlineStorage = "FlowChartOnlineStorage",
    /**
     * Flowchart: sequential access storage.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartMagneticTape = "FlowChartMagneticTape",
    /**
     * Flowchart: magnetic disk.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartMagneticDisk = "FlowChartMagneticDisk",
    /**
     * Flowchart: direct access storage.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartMagneticDrum = "FlowChartMagneticDrum",
    /**
     * Flowchart: display.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartDisplay = "FlowChartDisplay",
    /**
     * Flowchart: delay.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartDelay = "FlowChartDelay",
    /**
     * Flowchart: alternate process.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartAlternateProcess = "FlowChartAlternateProcess",
    /**
     * Flowchart: off-page connector.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    flowChartOffpageConnector = "FlowChartOffpageConnector",
    /**
     * Action button: blank.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonBlank = "ActionButtonBlank",
    /**
     * Action button: go home.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonHome = "ActionButtonHome",
    /**
     * Action button: help.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonHelp = "ActionButtonHelp",
    /**
     * Action button: get information.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonInformation = "ActionButtonInformation",
    /**
     * Action button: go forward or next.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonForwardNext = "ActionButtonForwardNext",
    /**
     * Action button: go back or previous.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonBackPrevious = "ActionButtonBackPrevious",
    /**
     * Action button: go to end.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonEnd = "ActionButtonEnd",
    /**
     * Action button: go to beginning.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonBeginning = "ActionButtonBeginning",
    /**
     * Action button: return.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonReturn = "ActionButtonReturn",
    /**
     * Action button: document.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonDocument = "ActionButtonDocument",
    /**
     * Action button: sound.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonSound = "ActionButtonSound",
    /**
     * Action button: video.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    actionButtonMovie = "ActionButtonMovie",
    /**
     * Gear: a gear with six teeth.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    gear6 = "Gear6",
    /**
     * Gear: a gear with nine teeth.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    gear9 = "Gear9",
    /**
     * Funnel geometric shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    funnel = "Funnel",
    /**
     * Plus sign.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    mathPlus = "MathPlus",
    /**
     * Minus sign.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    mathMinus = "MathMinus",
    /**
     * Multiplication sign.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    mathMultiply = "MathMultiply",
    /**
     * Division sign.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    mathDivide = "MathDivide",
    /**
     * Equals.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    mathEqual = "MathEqual",
    /**
     * Not equal.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    mathNotEqual = "MathNotEqual",
    /**
     * Four right triangles that define a rectangular shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    cornerTabs = "CornerTabs",
    /**
     * Four small squares that define a rectangular shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    squareTabs = "SquareTabs",
    /**
     * Four quarter circles that define a rectangular shape.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    plaqueTabs = "PlaqueTabs",
    /**
     * A rectangle divided into four parts along diagonal lines.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    chartX = "ChartX",
    /**
     * A rectangle divided into six parts along a vertical line and diagonal lines.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    chartStar = "ChartStar",
    /**
     * A rectangle divided vertically and horizontally into four quarters.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    chartPlus = "ChartPlus",
  }
  /**
   * Represents the available options when adding shapes.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  export interface ShapeAddOptions {
    /**
         * Specifies the height, in points, of the shape.
                    When not provided, a default value will be used.
                    Throws an `InvalidArgument` exception when set with a negative value.
         *
         * @remarks
         * [Api set: PowerPointApi 1.4]
         */
    height?: number;
    /**
         * Specifies the distance, in points, from the left side of the shape to the left side of the slide.
                    When not provided, a default value will be used.
         *
         * @remarks
         * [Api set: PowerPointApi 1.4]
         */
    left?: number;
    /**
         * Specifies the distance, in points, from the top edge of the shape to the top edge of the slide.
                    When not provided, a default value will be used.
         *
         * @remarks
         * [Api set: PowerPointApi 1.4]
         */
    top?: number;
    /**
         * Specifies the width, in points, of the shape.
                    When not provided, a default value will be used.
                    Throws an `InvalidArgument` exception when set with a negative value.
         *
         * @remarks
         * [Api set: PowerPointApi 1.4]
         */
    width?: number;
  }
  /**
   * Represents a collection of shapes.
   *
   * @remarks
   * [Api set: PowerPointApi 1.5]
   */
  export class ShapeScopedCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.Shape[];
    /**
     * Gets the number of shapes in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     * @returns The number of shapes in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a shape using its unique ID. An error is thrown if the shape doesn't exist.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     *
     * @param key - The ID of the shape.
     * @returns The shape with the unique ID. If such a shape doesn't exist, an error is thrown.
     */
    getItem(key: string): PowerPoint.Shape;
    /**
     * Gets a shape using its zero-based index in the collection. An error is thrown if the index is out of range.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     *
     * @param index - The index of the shape in the collection.
     * @returns The shape at the given index. An error is thrown if index is out of range.
     */
    getItemAt(index: number): PowerPoint.Shape;
    /**
     * Gets a shape using its unique ID. If such a shape doesn't exist, an object with an `isNullObject` property set to true is returned. For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     *
     * @param id - The ID of the shape.
     * @returns The shape with the unique ID. If such a shape doesn't exist, an object with an `isNullObject` property set to true is returned.
     */
    getItemOrNullObject(id: string): PowerPoint.Shape;
    /**
         * Groups all shapes in this collection into a single shape.
                    If the collection contains fewer than two shapes, then this method returns the `GeneralException` error.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         * @returns The newly created grouped shape as a {@link PowerPoint.Shape}.
         */
    group(): PowerPoint.Shape;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.ShapeScopedCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.ShapeScopedCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.ShapeScopedCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.ShapeScopedCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.ShapeScopedCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ShapeScopedCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.ShapeScopedCollectionData;
  }
  /**
   * Specifies the dash style for a line.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum ShapeLineDashStyle {
    /**
     * The dash line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dash = "Dash",
    /**
     * The dash-dot line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dashDot = "DashDot",
    /**
     * The dash-dot-dot line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dashDotDot = "DashDotDot",
    /**
     * The long dash line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    longDash = "LongDash",
    /**
     * The long dash-dot line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    longDashDot = "LongDashDot",
    /**
     * The round dot line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    roundDot = "RoundDot",
    /**
     * The solid line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    solid = "Solid",
    /**
     * The square dot line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    squareDot = "SquareDot",
    /**
     * The long dash-dot-dot line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    longDashDotDot = "LongDashDotDot",
    /**
     * The system dash line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    systemDash = "SystemDash",
    /**
     * The system dot line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    systemDot = "SystemDot",
    /**
     * The system dash-dot line pattern.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    systemDashDot = "SystemDashDot",
  }
  /**
   * Represents the properties for a table cell border.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export class Border extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Represents the line color in the hexadecimal format #RRGGBB (e.g., "FFA500") or as a named HTML color value (e.g., "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    color: string | undefined;
    /**
     * Represents the dash style of the line.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    dashStyle:
      | PowerPoint.ShapeLineDashStyle
      | "Dash"
      | "DashDot"
      | "DashDotDot"
      | "LongDash"
      | "LongDashDot"
      | "RoundDot"
      | "Solid"
      | "SquareDot"
      | "LongDashDotDot"
      | "SystemDash"
      | "SystemDot"
      | "SystemDashDot"
      | undefined;
    /**
     * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear).
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    transparency: number | undefined;
    /**
     * Represents the weight of the line, in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    weight: number | undefined;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(options?: PowerPoint.Interfaces.BorderLoadOptions): PowerPoint.Border;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Border;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Border;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Border` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.BorderData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.BorderData;
  }
  /**
   * Represents the borders for a table cell.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export class Borders extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Gets the bottom border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly bottom: PowerPoint.Border;
    /**
     * Gets the diagonal border (top-left to bottom-right).
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly diagonalDown: PowerPoint.Border;
    /**
     * Gets the diagonal border (bottom-left to top-right).
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly diagonalUp: PowerPoint.Border;
    /**
     * Gets the left border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly left: PowerPoint.Border;
    /**
     * Gets the right border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly right: PowerPoint.Border;
    /**
     * Gets the top border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly top: PowerPoint.Border;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.BordersLoadOptions,
    ): PowerPoint.Borders;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Borders;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Borders;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Borders` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.BordersData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.BordersData;
  }
  /**
   * Represents the margins of a table cell.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export class Margins extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies the bottom margin in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    bottom: number | undefined;
    /**
     * Specifies the left margin in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    left: number | undefined;
    /**
     * Specifies the right margin in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    right: number | undefined;
    /**
     * Specifies the top margin in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    top: number | undefined;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.MarginsLoadOptions,
    ): PowerPoint.Margins;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Margins;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Margins;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Margins` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.MarginsData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.MarginsData;
  }
  /**
   * Specifies a shape's fill type.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum ShapeFillType {
    /**
     * Specifies that the shape should have no fill.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    noFill = "NoFill",
    /**
     * Specifies that the shape should have regular solid fill.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    solid = "Solid",
    /**
     * Specifies that the shape should have gradient fill.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    gradient = "Gradient",
    /**
     * Specifies that the shape should have pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    pattern = "Pattern",
    /**
     * Specifies that the shape should have picture or texture fill.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    pictureAndTexture = "PictureAndTexture",
    /**
     * Specifies that the shape should have slide background fill.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    slideBackground = "SlideBackground",
  }
  /**
   * Represents the fill formatting of a shape object.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  export class ShapeFill extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Represents the shape fill foreground color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    foregroundColor: string;
    /**
     * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear). Returns `null` if the shape type doesn't support transparency or the shape fill has inconsistent transparency, such as with a gradient fill type.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    transparency: number;
    /**
     * Returns the fill type of the shape. See {@link PowerPoint.ShapeFillType} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly type:
      | PowerPoint.ShapeFillType
      | "NoFill"
      | "Solid"
      | "Gradient"
      | "Pattern"
      | "PictureAndTexture"
      | "SlideBackground";
    /**
     * Clears the fill formatting of this shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    clear(): void;
    /**
     * Sets the fill formatting of the shape to an image. This changes the fill type to `PictureAndTexture`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param base64EncodedImage - A string that is a Base64 encoding of the image data.
     */
    setImage(base64EncodedImage: string): void;
    /**
     * Sets the fill formatting of the shape to a uniform color. This changes the fill type to `Solid`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     *
     * @param color - A string that specifies the fill color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
     */
    setSolidColor(color: string): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.ShapeFillLoadOptions,
    ): PowerPoint.ShapeFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.ShapeFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.ShapeFill;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.ShapeFill` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ShapeFillData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.ShapeFillData;
  }
  /**
   * Represents the font attributes, such as font name, size, and color.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface FontProperties {
    /**
     * Represents whether the font uses all caps, where lowercase letters are shown as capital letters.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    allCaps?: boolean | undefined;
    /**
     * Represents the bold status of font.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    bold?: boolean | undefined;
    /**
     * Represents the HTML color in the hexadecimal format (e.g., "#FF0000" represents red) or as a named HTML color value (e.g., "red").
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    color?: string | undefined;
    /**
     * Represents the double-strikethrough status of the font.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    doubleStrikethrough?: boolean | undefined;
    /**
     * Represents the italic status of font.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    italic?: boolean | undefined;
    /**
     * Represents the font name (e.g., "Calibri"). If the text is a Complex Script or East Asian language, this is the corresponding font name; otherwise it's the Latin font name.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    name?: string | undefined;
    /**
     * Represents the font size in points (e.g., 11).
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    size?: number | undefined;
    /**
     * Represents whether the text uses small caps, where lowercase letters are shown as small capital letters.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    smallCaps?: boolean | undefined;
    /**
     * Represents the strikethrough status of the font.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    strikethrough?: boolean | undefined;
    /**
     * Represents the subscript status of the font.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    subscript?: boolean | undefined;
    /**
     * Represents the superscript status of the font.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    superscript?: boolean | undefined;
    /**
     * Type of underline applied to the font. See {@link PowerPoint.ShapeFontUnderlineStyle} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    underline?:
      | PowerPoint.ShapeFontUnderlineStyle
      | "None"
      | "Single"
      | "Double"
      | "Heavy"
      | "Dotted"
      | "DottedHeavy"
      | "Dash"
      | "DashHeavy"
      | "DashLong"
      | "DashLongHeavy"
      | "DotDash"
      | "DotDashHeavy"
      | "DotDotDash"
      | "DotDotDashHeavy"
      | "Wavy"
      | "WavyHeavy"
      | "WavyDouble"
      | undefined;
  }
  /**
   * Represents a sequence of one or more characters with the same font attributes.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface TextRun {
    /**
     * The font attributes (such as font name, font size, and color) applied to this text run.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    font?: PowerPoint.FontProperties;
    /**
     * The text of this text run.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    text: string;
  }
  /**
   * Represents a table.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export class TableCell extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Gets the collection of borders for the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly borders: PowerPoint.Borders;
    /**
     * Gets the fill color of the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly fill: PowerPoint.ShapeFill;
    /**
     * Gets the font of the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly font: PowerPoint.ShapeFont;
    /**
     * Gets the set of margins in the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly margins: PowerPoint.Margins;
    /**
         * Gets the number of table columns this cell spans across.
                    Will be greater than or equal to 1.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    readonly columnCount: number;
    /**
     * Gets the zero-based column index of the cell within the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly columnIndex: number;
    /**
     * Specifies the horizontal alignment of the text in the table cell. Returns `null` if the cell text contains different alignments.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    horizontalAlignment:
      | PowerPoint.ParagraphHorizontalAlignment
      | "Left"
      | "Center"
      | "Right"
      | "Justify"
      | "JustifyLow"
      | "Distributed"
      | "ThaiDistributed"
      | null;
    /**
     * Specifies the indent level of the text in the table cell. Returns `null` if the cell text contains different indent levels.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    indentLevel: number | null;
    /**
         * Gets the number of table rows this cell spans across.
                    Will be greater than or equal to 1.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    readonly rowCount: number;
    /**
     * Gets the zero-based row index of the cell within the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly rowIndex: number;
    /**
     * Specifies the text content of the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    text: string;
    /**
         * Specifies the contents of the table cell as an array of {@link PowerPoint.TextRun} objects.
                    Each `TextRun` object represents a sequence of one or more characters that share the same font attributes.
         *
         * @remarks
         * [Api set: PowerPointApi 1.9]
         */
    textRuns: PowerPoint.TextRun[];
    /**
     * Specifies the vertical alignment of the text in the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    verticalAlignment:
      | PowerPoint.TextVerticalAlignment
      | "Top"
      | "Middle"
      | "Bottom"
      | "TopCentered"
      | "MiddleCentered"
      | "BottomCentered";
    /**
         * Resizes the table cell to span across a specified number of rows and columns.
                    If rowCount or columnCount are greater than 1, the cell will become a merged area. If the cell
                    is already a merged area and rowCount and columnCount are set to 1, the cell will no longer be
                    a merged area.
         *
         * @remarks
         * [Api set: PowerPointApi 1.9]
         *
         * @param rowCount - The number of rows the cell will span across. Must be greater than 0.
         * @param columnCount - The number of columns the cell will span across. Must be greater than 0.
         */
    resize(rowCount: number, columnCount: number): void;
    /**
     * Splits the cell into the specified number of rows and columns.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param rowCount - The number of rows to split into. Must be greater than 0.
     * @param columnCount - The number of columns to split into. Must be greater than 0.
     */
    split(rowCount: number, columnCount: number): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TableCellLoadOptions,
    ): PowerPoint.TableCell;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TableCell;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.TableCell;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TableCell` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TableCellData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.TableCellData;
  }
  /**
   * Represents a collection of table cells.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export class TableCellCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.TableCell[];
    /**
     * Gets the number of table cells in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     * @returns The number of table cells in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets the table cell using its zero-based index in the collection. If the `TableCell` doesn't exist, then this method returns an object with its `isNullObject` property set to `true`. For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param row - Row index value of the table cell to be retrieved, as a zero-based index.
     * @param column - Column index value of the table cell to be retrieved, as a zero-based index.
     * @returns The `TableCell` object.
     */
    getItemAtOrNullObject(row: number, column: number): PowerPoint.TableCell;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TableCellCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.TableCellCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TableCellCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.TableCellCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TableCellCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TableCellCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.TableCellCollectionData;
  }
  /**
   * Represents a column in a table.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export class TableColumn extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns the index number of the column within the column collection of the table. Zero-indexed.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly columnIndex: number;
    /**
     * Retrieves the width of the column in points. If the set column width is less than the minimum width, the column width will be increased to the minimum width.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    width: number;
    /**
     * Deletes the column.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    delete(): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TableColumnLoadOptions,
    ): PowerPoint.TableColumn;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TableColumn;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.TableColumn;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TableColumn` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TableColumnData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.TableColumnData;
  }
  /**
   * Represents a collection of table columns.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export class TableColumnCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.TableColumn[];
    /**
     * Adds one or more columns to the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param index - Optional. Specifies the zero-based index where the new columns are added. Existing columns starting at the index location are shifted right. If the index value is undefined, null, -1, or greater than the number of columns in the table, the new columns are added at the end of the table.
     * @param count - Optional. The number of columns to add. If the value is undefined or 0, only one column is added.
     */
    // eslint-disable-next-line @definitelytyped/redundant-undefined
    add(index?: number | null | undefined, count?: number | undefined): void;
    /**
     * Deletes the specified columns from the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param columns - An array of `TableColumn` objects representing the columns to be deleted.
     */
    deleteColumns(columns: PowerPoint.TableColumn[]): void;
    /**
     * Gets the number of columns in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     * @returns The number of columns in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets the column using its zero-based index in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param index - Index value of the column to be retrieved, as a zero-based index.
     * @returns The column object.
     */
    getItemAt(index: number): PowerPoint.TableColumn;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TableColumnCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.TableColumnCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TableColumnCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.TableColumnCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TableColumnCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TableColumnCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.TableColumnCollectionData;
  }
  /**
   * Represents the available options when clearing a table.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export interface TableClearOptions {
    /**
     * Specifies if both values and formatting of the table should be cleared.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    all?: boolean;
    /**
     * Specifies if the formatting of the table should be cleared.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    format?: boolean;
    /**
     * Specifies if the values of the table should be cleared.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    text?: boolean;
  }
  /**
   * Represents a row in a table.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export class TableRow extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Retrieves the current height of the row in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly currentHeight: number;
    /**
     * Specifies the height of the row in points. If the set row height is less than the minimum height, the row height will be increased to the minimum height.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    height: number;
    /**
     * Returns the index number of the row within the rows collection of the table. Zero-indexed.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly rowIndex: number;
    /**
     * Deletes the row.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    delete(): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TableRowLoadOptions,
    ): PowerPoint.TableRow;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TableRow;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.TableRow;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TableRow` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TableRowData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.TableRowData;
  }
  /**
   * Represents a collection of table rows.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export class TableRowCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.TableRow[];
    /**
     * Adds one or more rows to the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param index - Optional. Specifies the zero-based index where the new rows are added. Existing rows starting at the index location are shifted down. If the index value is undefined, null, -1, or greater than the number of rows in the table, the new rows are added at the end of the table.
     * @param count - Optional. The number of rows to add. If the value is undefined or 0, only one row is added.
     */
    // eslint-disable-next-line @definitelytyped/redundant-undefined
    add(index?: number | null | undefined, count?: number | undefined): void;
    /**
     * Deletes the specified rows from the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param rows - An array of `TableRow` objects representing the rows to be deleted.
     */
    deleteRows(rows: PowerPoint.TableRow[]): void;
    /**
     * Gets the number of rows in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     * @returns The number of rows in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets the row using its zero-based index in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param index - Index value of the row to be retrieved, as a zero-based index.
     * @returns The row object.
     */
    getItemAt(index: number): PowerPoint.TableRow;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TableRowCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.TableRowCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TableRowCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.TableRowCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TableRowCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TableRowCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.TableRowCollectionData;
  }
  /**
   * Represents the available built-in table styles.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  enum TableStyle {
    /**
     * Specifies the style "No style, No grid" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    noStyleNoGrid = "NoStyleNoGrid",
    /**
     * Specifies the style "Themed style 1 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle1Accent1 = "ThemedStyle1Accent1",
    /**
     * Specifies the style "Themed style 1 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle1Accent2 = "ThemedStyle1Accent2",
    /**
     * Specifies the style "Themed style 1 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle1Accent3 = "ThemedStyle1Accent3",
    /**
     * Specifies the style "Themed style 1 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle1Accent4 = "ThemedStyle1Accent4",
    /**
     * Specifies the style "Themed style 1 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle1Accent5 = "ThemedStyle1Accent5",
    /**
     * Specifies the style "Themed style 1 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle1Accent6 = "ThemedStyle1Accent6",
    /**
     * Specifies the style "No style, Table grid" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    noStyleTableGrid = "NoStyleTableGrid",
    /**
     * Specifies the style "Themed style 2 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle2Accent1 = "ThemedStyle2Accent1",
    /**
     * Specifies the style "Themed style 2 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle2Accent2 = "ThemedStyle2Accent2",
    /**
     * Specifies the style "Themed style 2 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle2Accent3 = "ThemedStyle2Accent3",
    /**
     * Specifies the style "Themed style 2 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle2Accent4 = "ThemedStyle2Accent4",
    /**
     * Specifies the style "Themed style 2 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle2Accent5 = "ThemedStyle2Accent5",
    /**
     * Specifies the style "Themed style 2 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    themedStyle2Accent6 = "ThemedStyle2Accent6",
    /**
     * Specifies the style "Light Style 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle1 = "LightStyle1",
    /**
     * Specifies the style "Light style 1 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle1Accent1 = "LightStyle1Accent1",
    /**
     * Specifies the style "Light style 1 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle1Accent2 = "LightStyle1Accent2",
    /**
     * Specifies the style "Light style 1 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle1Accent3 = "LightStyle1Accent3",
    /**
     * Specifies the style "Light style 1 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle1Accent4 = "LightStyle1Accent4",
    /**
     * Specifies the style "Light style 1 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle1Accent5 = "LightStyle1Accent5",
    /**
     * Specifies the style "Light style 1 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle1Accent6 = "LightStyle1Accent6",
    /**
     * Specifies the style "Light Style 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle2 = "LightStyle2",
    /**
     * Specifies the style "Light style 2 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle2Accent1 = "LightStyle2Accent1",
    /**
     * Specifies the style "Light style 2 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle2Accent2 = "LightStyle2Accent2",
    /**
     * Specifies the style "Light style 2 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle2Accent3 = "LightStyle2Accent3",
    /**
     * Specifies the style "Light style 2 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle2Accent4 = "LightStyle2Accent4",
    /**
     * Specifies the style "Light style 2 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle2Accent5 = "LightStyle2Accent5",
    /**
     * Specifies the style "Light style 2 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle2Accent6 = "LightStyle2Accent6",
    /**
     * Specifies the style "Light Style 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle3 = "LightStyle3",
    /**
     * Specifies the style "Light style 3 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle3Accent1 = "LightStyle3Accent1",
    /**
     * Specifies the style "Light style 3 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle3Accent2 = "LightStyle3Accent2",
    /**
     * Specifies the style "Light style 3 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle3Accent3 = "LightStyle3Accent3",
    /**
     * Specifies the style "Light style 3 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle3Accent4 = "LightStyle3Accent4",
    /**
     * Specifies the style "Light style 3 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle3Accent5 = "LightStyle3Accent5",
    /**
     * Specifies the style "Light style 3 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    lightStyle3Accent6 = "LightStyle3Accent6",
    /**
     * Specifies the style "Medium Style 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle1 = "MediumStyle1",
    /**
     * Specifies the style "Medium style 1 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle1Accent1 = "MediumStyle1Accent1",
    /**
     * Specifies the style "Medium style 1 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle1Accent2 = "MediumStyle1Accent2",
    /**
     * Specifies the style "Medium style 1 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle1Accent3 = "MediumStyle1Accent3",
    /**
     * Specifies the style "Medium style 1 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle1Accent4 = "MediumStyle1Accent4",
    /**
     * Specifies the style "Medium style 1 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle1Accent5 = "MediumStyle1Accent5",
    /**
     * Specifies the style "Medium style 1 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle1Accent6 = "MediumStyle1Accent6",
    /**
     * Specifies the style "Medium Style 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle2 = "MediumStyle2",
    /**
     * Specifies the style "Medium style 2 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle2Accent1 = "MediumStyle2Accent1",
    /**
     * Specifies the style "Medium style 2 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle2Accent2 = "MediumStyle2Accent2",
    /**
     * Specifies the style "Medium style 2 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle2Accent3 = "MediumStyle2Accent3",
    /**
     * Specifies the style "Medium style 2 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle2Accent4 = "MediumStyle2Accent4",
    /**
     * Specifies the style "Medium style 2 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle2Accent5 = "MediumStyle2Accent5",
    /**
     * Specifies the style "Medium style 2 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle2Accent6 = "MediumStyle2Accent6",
    /**
     * Specifies the style "Medium Style 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle3 = "MediumStyle3",
    /**
     * Specifies the style "Medium style 3 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle3Accent1 = "MediumStyle3Accent1",
    /**
     * Specifies the style "Medium style 3 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle3Accent2 = "MediumStyle3Accent2",
    /**
     * Specifies the style "Medium style 3 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle3Accent3 = "MediumStyle3Accent3",
    /**
     * Specifies the style "Medium style 3 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle3Accent4 = "MediumStyle3Accent4",
    /**
     * Specifies the style "Medium style 3 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle3Accent5 = "MediumStyle3Accent5",
    /**
     * Specifies the style "Medium style 3 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle3Accent6 = "MediumStyle3Accent6",
    /**
     * Specifies the style "Medium Style 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle4 = "MediumStyle4",
    /**
     * Specifies the style "Medium style 4 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle4Accent1 = "MediumStyle4Accent1",
    /**
     * Specifies the style "Medium style 4 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle4Accent2 = "MediumStyle4Accent2",
    /**
     * Specifies the style "Medium style 4 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle4Accent3 = "MediumStyle4Accent3",
    /**
     * Specifies the style "Medium style 4 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle4Accent4 = "MediumStyle4Accent4",
    /**
     * Specifies the style "Medium style 4 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle4Accent5 = "MediumStyle4Accent5",
    /**
     * Specifies the style "Medium style 4 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    mediumStyle4Accent6 = "MediumStyle4Accent6",
    /**
     * Specifies the style "Dark Style 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle1 = "DarkStyle1",
    /**
     * Specifies the style "Dark style 1 - Accent 1" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle1Accent1 = "DarkStyle1Accent1",
    /**
     * Specifies the style "Dark style 1 - Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle1Accent2 = "DarkStyle1Accent2",
    /**
     * Specifies the style "Dark style 1 - Accent 3" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle1Accent3 = "DarkStyle1Accent3",
    /**
     * Specifies the style "Dark style 1 - Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle1Accent4 = "DarkStyle1Accent4",
    /**
     * Specifies the style "Dark style 1 - Accent 5" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle1Accent5 = "DarkStyle1Accent5",
    /**
     * Specifies the style "Dark style 1 - Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle1Accent6 = "DarkStyle1Accent6",
    /**
     * Specifies the style "Dark Style 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle2 = "DarkStyle2",
    /**
     * Specifies the style "Dark style 2 - Accent 1/Accent 2" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle2Accent1 = "DarkStyle2Accent1",
    /**
     * Specifies the style "Dark style 2 - Accent 3/Accent 4" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle2Accent2 = "DarkStyle2Accent2",
    /**
     * Specifies the style "Dark style 2 - Accent 5/Accent 6" in UI.
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    darkStyle2Accent3 = "DarkStyle2Accent3",
  }
  /**
   * Represents the available table style settings.
   *
   * @remarks
   * [Api set: PowerPointApi 1.9]
   */
  export class TableStyleSettings extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies if the columns show banded formatting in which odd columns are highlighted differently from even ones, to make reading the table easier.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    areColumnsBanded: boolean;
    /**
     * Specifies if the rows show banded formatting in which odd rows are highlighted differently from even ones, to make reading the table easier.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    areRowsBanded: boolean;
    /**
     * Specifies if the first column contains special formatting.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    isFirstColumnHighlighted: boolean;
    /**
     * Specifies if the first row contains special formatting.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    isFirstRowHighlighted: boolean;
    /**
     * Specifies if the last column contains special formatting.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    isLastColumnHighlighted: boolean;
    /**
     * Specifies if the last row contains special formatting.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    isLastRowHighlighted: boolean;
    /**
     * Specifies the table style.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    style:
      | PowerPoint.TableStyle
      | "NoStyleNoGrid"
      | "ThemedStyle1Accent1"
      | "ThemedStyle1Accent2"
      | "ThemedStyle1Accent3"
      | "ThemedStyle1Accent4"
      | "ThemedStyle1Accent5"
      | "ThemedStyle1Accent6"
      | "NoStyleTableGrid"
      | "ThemedStyle2Accent1"
      | "ThemedStyle2Accent2"
      | "ThemedStyle2Accent3"
      | "ThemedStyle2Accent4"
      | "ThemedStyle2Accent5"
      | "ThemedStyle2Accent6"
      | "LightStyle1"
      | "LightStyle1Accent1"
      | "LightStyle1Accent2"
      | "LightStyle1Accent3"
      | "LightStyle1Accent4"
      | "LightStyle1Accent5"
      | "LightStyle1Accent6"
      | "LightStyle2"
      | "LightStyle2Accent1"
      | "LightStyle2Accent2"
      | "LightStyle2Accent3"
      | "LightStyle2Accent4"
      | "LightStyle2Accent5"
      | "LightStyle2Accent6"
      | "LightStyle3"
      | "LightStyle3Accent1"
      | "LightStyle3Accent2"
      | "LightStyle3Accent3"
      | "LightStyle3Accent4"
      | "LightStyle3Accent5"
      | "LightStyle3Accent6"
      | "MediumStyle1"
      | "MediumStyle1Accent1"
      | "MediumStyle1Accent2"
      | "MediumStyle1Accent3"
      | "MediumStyle1Accent4"
      | "MediumStyle1Accent5"
      | "MediumStyle1Accent6"
      | "MediumStyle2"
      | "MediumStyle2Accent1"
      | "MediumStyle2Accent2"
      | "MediumStyle2Accent3"
      | "MediumStyle2Accent4"
      | "MediumStyle2Accent5"
      | "MediumStyle2Accent6"
      | "MediumStyle3"
      | "MediumStyle3Accent1"
      | "MediumStyle3Accent2"
      | "MediumStyle3Accent3"
      | "MediumStyle3Accent4"
      | "MediumStyle3Accent5"
      | "MediumStyle3Accent6"
      | "MediumStyle4"
      | "MediumStyle4Accent1"
      | "MediumStyle4Accent2"
      | "MediumStyle4Accent3"
      | "MediumStyle4Accent4"
      | "MediumStyle4Accent5"
      | "MediumStyle4Accent6"
      | "DarkStyle1"
      | "DarkStyle1Accent1"
      | "DarkStyle1Accent2"
      | "DarkStyle1Accent3"
      | "DarkStyle1Accent4"
      | "DarkStyle1Accent5"
      | "DarkStyle1Accent6"
      | "DarkStyle2"
      | "DarkStyle2Accent1"
      | "DarkStyle2Accent2"
      | "DarkStyle2Accent3";
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TableStyleSettingsLoadOptions,
    ): PowerPoint.TableStyleSettings;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TableStyleSettings;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.TableStyleSettings;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TableStyleSettings` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TableStyleSettingsData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.TableStyleSettingsData;
  }
  /**
   * Represents a table.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export class Table extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Gets the collection of columns in the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly columns: PowerPoint.TableColumnCollection;
    /**
     * Gets the collection of rows in the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly rows: PowerPoint.TableRowCollection;
    /**
     * Gets the table style settings.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    readonly styleSettings: PowerPoint.TableStyleSettings;
    /**
     * Gets the number of columns in the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly columnCount: number;
    /**
     * Gets the number of rows in the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly rowCount: number;
    /**
     * Gets all of the values in the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly values: string[][];
    /**
     * Clears table values and formatting.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param options - Provides options for clearing the table.
     */
    clear(options?: PowerPoint.TableClearOptions): void;
    /**
     * Gets the cell at the specified `rowIndex` and `columnIndex`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param rowIndex - The zero-based row index of the cell.
     * @param columnIndex - The zero-based column index of the cell.
     * @returns The cell at the specified row and column. If the cell is part of a merged area and not the top left cell of the merged area, an object with the `isNullObject` property set to `true` is returned. For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
     */
    getCellOrNullObject(
      rowIndex: number,
      columnIndex: number,
    ): PowerPoint.TableCell;
    /**
     * Gets a collection of cells that represent the merged areas of the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     * @returns a `TableCellCollection` with cells that represent the merged areas of the table.
     */
    getMergedAreas(): PowerPoint.TableCellCollection;
    /**
     * Gets the shape object for the table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    getShape(): PowerPoint.Shape;
    /**
     * Creates a merged area starting at the cell specified by rowIndex and columnIndex. The merged area spans across a specified number of rows and columns.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     *
     * @param rowIndex - The zero-based row index of the cell to start the merged area.
     * @param columnIndex - The zero-based column index of the cell to start the merged area.
     * @param rowCount - The number of rows to merge with the starting cell. Must be greater than 0.
     * @param columnCount - The number of columns to merge with the starting cell. Must be greater than 0.
     */
    mergeCells(
      rowIndex: number,
      columnIndex: number,
      rowCount: number,
      columnCount: number,
    ): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(options?: PowerPoint.Interfaces.TableLoadOptions): PowerPoint.Table;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Table;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Table;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Table` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TableData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.TableData;
  }
  /**
   * Represents the fill formatting of a table cell.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface FillProperties {
    /**
     * Represents the shape fill color in the hexadecimal format #RRGGBB (e.g., "FFA500") or as a named HTML color value (e.g., "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    color?: string | undefined;
    /**
     * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    transparency?: number | undefined;
  }
  /**
   * Represents the properties for a table cell border.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface BorderProperties {
    /**
     * Represents the line color in the hexadecimal format #RRGGBB (e.g., "FFA500") or as a named HTML color value (e.g., "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    color?: string | undefined;
    /**
     * Represents the dash style of the line.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    dashStyle?:
      | PowerPoint.ShapeLineDashStyle
      | "Dash"
      | "DashDot"
      | "DashDotDot"
      | "LongDash"
      | "LongDashDot"
      | "RoundDot"
      | "Solid"
      | "SquareDot"
      | "LongDashDotDot"
      | "SystemDash"
      | "SystemDot"
      | "SystemDashDot"
      | undefined;
    /**
     * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear).
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    transparency?: number | undefined;
    /**
     * Represents the weight of the line, in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    weight?: number | undefined;
  }
  /**
   * Represents the borders of a table cell.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface TableCellBorders {
    /**
     * Represents the bottom border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    bottom?: PowerPoint.BorderProperties;
    /**
     * Represents the diagonal border (top-left to bottom-right).
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    diagonalDown?: PowerPoint.BorderProperties;
    /**
     * Represents the diagonal border (bottom-left to top-right).
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    diagonalUp?: PowerPoint.BorderProperties;
    /**
     * Represents the left border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    left?: PowerPoint.BorderProperties;
    /**
     * Represents the right border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    right?: PowerPoint.BorderProperties;
    /**
     * Represents the top border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    top?: PowerPoint.BorderProperties;
  }
  /**
   * Represents the margins of a table cell.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface TableCellMargins {
    /**
     * Specifies the bottom margin in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    bottom?: number | undefined;
    /**
     * Specifies the left margin in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    left?: number | undefined;
    /**
     * Specifies the right margin in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    right?: number | undefined;
    /**
     * Specifies the top margin in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    top?: number | undefined;
  }
  /**
   * Represents the table cell properties to update.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface TableCellProperties {
    /**
     * Specifies the border formatting of the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    borders?: PowerPoint.TableCellBorders;
    /**
     * Specifies the fill formatting of the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    fill?: PowerPoint.FillProperties;
    /**
     * Specifies the font formatting of the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    font?: PowerPoint.FontProperties;
    /**
     * Specifies the horizontal alignment of the text in the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    horizontalAlignment?:
      | PowerPoint.ParagraphHorizontalAlignment
      | "Left"
      | "Center"
      | "Right"
      | "Justify"
      | "JustifyLow"
      | "Distributed"
      | "ThaiDistributed"
      | undefined;
    /**
     * Specifies the indent level of the text in the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    indentLevel?: number | undefined;
    /**
     * Specifies the margin settings in the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    margins?: PowerPoint.TableCellMargins;
    /**
         * Specifies the text content of the table cell.
                    
                    If a portion of the text requires different formatting, use the `textRuns` property instead.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    text?: string;
    /**
         * Specifies the contents of the table cell as an array of {@link PowerPoint.TextRun} objects.
                    Each `TextRun` object represents a sequence of one or more characters that share the same font attributes.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    textRuns?: PowerPoint.TextRun[];
    /**
     * Specifies the vertical alignment of the text in the table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    verticalAlignment?:
      | PowerPoint.TextVerticalAlignment
      | "Top"
      | "Middle"
      | "Bottom"
      | "TopCentered"
      | "MiddleCentered"
      | "BottomCentered"
      | undefined;
  }
  /**
   * Provides the table column properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface TableColumnProperties {
    /**
         * Represents the desired width of each column in points, or is undefined.
                    
                    When a table is being added, for columns whose width is undefined,
                    the column width will be calculated by evenly dividing the remaining width
                    of the table amongst those columns. If the table doesn't have a defined width,
                    a default column width will be used.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    columnWidth?: number | undefined;
  }
  /**
   * Represents the properties of a merged area of cells in a table.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface TableMergedAreaProperties {
    /**
         * Specifies the number of columns for the merged cells area.
                    Must be 1 or greater.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    columnCount: number;
    /**
     * Specifies the zero-based index of the column of the top left cell of the merged area.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    columnIndex: number;
    /**
         * Specifies the number of rows for the merged cells area.
                    Must be 1 or greater.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    rowCount: number;
    /**
     * Specifies the zero-based index of the row of the top left cell of the merged area.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    rowIndex: number;
  }
  /**
   * Provides the table row properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface TableRowProperties {
    /**
         * Represents the desired height of each row in points, or is undefined.
                    
                    When a table is being added, for rows whose height is undefined,
                    the row height will be calculated by evenly dividing the remaining height
                    of the table amongst those rows. If the table doesn't have a defined height,
                    a default row height will be used.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    rowHeight?: number | undefined;
  }
  /**
   * Represents the available options when adding a table.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface TableAddOptions {
    /**
         * If provided, specifies properties for each column in the table.
                    The array length must be equal to the number of columns in the table.
                    Specify an empty object for columns that should use the default formatting.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    columns?: PowerPoint.TableColumnProperties[];
    /**
         * Specifies the height, in points, of the table.
                    A default value is used when this parameter isn't provided.
                    Throws an `InvalidArgument` exception when set with a negative value.
                    
                    Note: If the table height isn't evenly divisible by the number of rows, PowerPoint sets it to the nearest possible value.
                    For example, a height of 400 for 3 rows may result in an actual height of 399.9999.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    height?: number | undefined;
    /**
         * Specifies the distance, in points, from the left side of the table to the left side of the slide.
                    The table is centered horizontally when this parameter isn't provided.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    left?: number | undefined;
    /**
     * If specified, represents an rectangular area where multiple cells appear as a single cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    mergedAreas?: PowerPoint.TableMergedAreaProperties[];
    /**
         * If provided, specifies properties for each row in the table.
                    The array length must be equal to the number of rows in the table.
                    Specify an empty object for rows that should use the default formatting.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    rows?: PowerPoint.TableRowProperties[];
    /**
         * If provided, specifies properties for each cell in the table.
                    
                    This should be a 2D array with the same number of rows and columns as the table.
                    If a cell doesn't require specific formatting, specify an empty object for that cell.
                    Only the top left cell of a merged are can have properties specified, which will be applied
                    to the entire merged area. For the other cells in the merged area, an empty object should be provided.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    specificCellProperties?: PowerPoint.TableCellProperties[][];
    /**
     * Specifies value that represents the table style.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    style?:
      | PowerPoint.TableStyle
      | "NoStyleNoGrid"
      | "ThemedStyle1Accent1"
      | "ThemedStyle1Accent2"
      | "ThemedStyle1Accent3"
      | "ThemedStyle1Accent4"
      | "ThemedStyle1Accent5"
      | "ThemedStyle1Accent6"
      | "NoStyleTableGrid"
      | "ThemedStyle2Accent1"
      | "ThemedStyle2Accent2"
      | "ThemedStyle2Accent3"
      | "ThemedStyle2Accent4"
      | "ThemedStyle2Accent5"
      | "ThemedStyle2Accent6"
      | "LightStyle1"
      | "LightStyle1Accent1"
      | "LightStyle1Accent2"
      | "LightStyle1Accent3"
      | "LightStyle1Accent4"
      | "LightStyle1Accent5"
      | "LightStyle1Accent6"
      | "LightStyle2"
      | "LightStyle2Accent1"
      | "LightStyle2Accent2"
      | "LightStyle2Accent3"
      | "LightStyle2Accent4"
      | "LightStyle2Accent5"
      | "LightStyle2Accent6"
      | "LightStyle3"
      | "LightStyle3Accent1"
      | "LightStyle3Accent2"
      | "LightStyle3Accent3"
      | "LightStyle3Accent4"
      | "LightStyle3Accent5"
      | "LightStyle3Accent6"
      | "MediumStyle1"
      | "MediumStyle1Accent1"
      | "MediumStyle1Accent2"
      | "MediumStyle1Accent3"
      | "MediumStyle1Accent4"
      | "MediumStyle1Accent5"
      | "MediumStyle1Accent6"
      | "MediumStyle2"
      | "MediumStyle2Accent1"
      | "MediumStyle2Accent2"
      | "MediumStyle2Accent3"
      | "MediumStyle2Accent4"
      | "MediumStyle2Accent5"
      | "MediumStyle2Accent6"
      | "MediumStyle3"
      | "MediumStyle3Accent1"
      | "MediumStyle3Accent2"
      | "MediumStyle3Accent3"
      | "MediumStyle3Accent4"
      | "MediumStyle3Accent5"
      | "MediumStyle3Accent6"
      | "MediumStyle4"
      | "MediumStyle4Accent1"
      | "MediumStyle4Accent2"
      | "MediumStyle4Accent3"
      | "MediumStyle4Accent4"
      | "MediumStyle4Accent5"
      | "MediumStyle4Accent6"
      | "DarkStyle1"
      | "DarkStyle1Accent1"
      | "DarkStyle1Accent2"
      | "DarkStyle1Accent3"
      | "DarkStyle1Accent4"
      | "DarkStyle1Accent5"
      | "DarkStyle1Accent6"
      | "DarkStyle2"
      | "DarkStyle2Accent1"
      | "DarkStyle2Accent2"
      | "DarkStyle2Accent3";
    /**
         * Specifies the distance, in points, from the top edge of the table to the top edge of the slide.
                    A default value is used when this parameter isn't provided.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    top?: number | undefined;
    /**
         * Specifies the formatting which applies uniformly to all of the table cells.
                    
                    To apply specific formatting to individual cells, use `specificCellProperties`.
                    
                    If both uniformCellProperties and specificCellProperties are undefined, the default formatting
                    will be used, and the default table style will be applied. The table will have the same
                    appearance as when the user adds a table through the PowerPoint UI.
                    
                    To provide a plain appearance for the table, set this property to an empty object
                    and don't specify `specificCellProperties`.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    uniformCellProperties?: PowerPoint.TableCellProperties;
    /**
         * If provided, specifies the values for the table.
                    
                    When the table contains areas of merged cells,
                    only the top left cell of each merged area can have a
                    non-empty string value. The other cells
                    in the merged area must be an empty string.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    values?: string[][];
    /**
         * Specifies the width, in points, of the table.
                    A default value is used when this parameter isn't provided.
                    Throws an `InvalidArgument` exception when set with a negative value.
                    
                    Note: If the table width isn't evenly divisible by the number of columns, PowerPoint sets it to the nearest possible value.
                    For example, a width of 400 for 3 columns may result in an actual width of 399.9999.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    width?: number | undefined;
  }
  /**
   * Represents the collection of shapes.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export class ShapeCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.Shape[];
    /**
     * Adds a geometric shape to the slide. Returns a `Shape` object that represents the new shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     *
     * @param geometricShapeType - Specifies the type of the geometric shape. See {@link PowerPoint.GeometricShapeType} for details.
     * @param options - An optional parameter to specify the additional options such as the position of the shape.
     * @returns The newly inserted shape.
     */
    addGeometricShape(
      geometricShapeType: PowerPoint.GeometricShapeType,
      options?: PowerPoint.ShapeAddOptions,
    ): PowerPoint.Shape;
    /**
     * Adds a geometric shape to the slide. Returns a `Shape` object that represents the new shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     *
     * @param geometricShapeType - Specifies the type of the geometric shape. See {@link PowerPoint.GeometricShapeType} for details.
     * @param options - An optional parameter to specify the additional options such as the position of the shape.
     * @returns The newly inserted shape.
     */
    addGeometricShape(
      geometricShapeType:
        | "LineInverse"
        | "Triangle"
        | "RightTriangle"
        | "Rectangle"
        | "Diamond"
        | "Parallelogram"
        | "Trapezoid"
        | "NonIsoscelesTrapezoid"
        | "Pentagon"
        | "Hexagon"
        | "Heptagon"
        | "Octagon"
        | "Decagon"
        | "Dodecagon"
        | "Star4"
        | "Star5"
        | "Star6"
        | "Star7"
        | "Star8"
        | "Star10"
        | "Star12"
        | "Star16"
        | "Star24"
        | "Star32"
        | "RoundRectangle"
        | "Round1Rectangle"
        | "Round2SameRectangle"
        | "Round2DiagonalRectangle"
        | "SnipRoundRectangle"
        | "Snip1Rectangle"
        | "Snip2SameRectangle"
        | "Snip2DiagonalRectangle"
        | "Plaque"
        | "Ellipse"
        | "Teardrop"
        | "HomePlate"
        | "Chevron"
        | "PieWedge"
        | "Pie"
        | "BlockArc"
        | "Donut"
        | "NoSmoking"
        | "RightArrow"
        | "LeftArrow"
        | "UpArrow"
        | "DownArrow"
        | "StripedRightArrow"
        | "NotchedRightArrow"
        | "BentUpArrow"
        | "LeftRightArrow"
        | "UpDownArrow"
        | "LeftUpArrow"
        | "LeftRightUpArrow"
        | "QuadArrow"
        | "LeftArrowCallout"
        | "RightArrowCallout"
        | "UpArrowCallout"
        | "DownArrowCallout"
        | "LeftRightArrowCallout"
        | "UpDownArrowCallout"
        | "QuadArrowCallout"
        | "BentArrow"
        | "UturnArrow"
        | "CircularArrow"
        | "LeftCircularArrow"
        | "LeftRightCircularArrow"
        | "CurvedRightArrow"
        | "CurvedLeftArrow"
        | "CurvedUpArrow"
        | "CurvedDownArrow"
        | "SwooshArrow"
        | "Cube"
        | "Can"
        | "LightningBolt"
        | "Heart"
        | "Sun"
        | "Moon"
        | "SmileyFace"
        | "IrregularSeal1"
        | "IrregularSeal2"
        | "FoldedCorner"
        | "Bevel"
        | "Frame"
        | "HalfFrame"
        | "Corner"
        | "DiagonalStripe"
        | "Chord"
        | "Arc"
        | "LeftBracket"
        | "RightBracket"
        | "LeftBrace"
        | "RightBrace"
        | "BracketPair"
        | "BracePair"
        | "Callout1"
        | "Callout2"
        | "Callout3"
        | "AccentCallout1"
        | "AccentCallout2"
        | "AccentCallout3"
        | "BorderCallout1"
        | "BorderCallout2"
        | "BorderCallout3"
        | "AccentBorderCallout1"
        | "AccentBorderCallout2"
        | "AccentBorderCallout3"
        | "WedgeRectCallout"
        | "WedgeRRectCallout"
        | "WedgeEllipseCallout"
        | "CloudCallout"
        | "Cloud"
        | "Ribbon"
        | "Ribbon2"
        | "EllipseRibbon"
        | "EllipseRibbon2"
        | "LeftRightRibbon"
        | "VerticalScroll"
        | "HorizontalScroll"
        | "Wave"
        | "DoubleWave"
        | "Plus"
        | "FlowChartProcess"
        | "FlowChartDecision"
        | "FlowChartInputOutput"
        | "FlowChartPredefinedProcess"
        | "FlowChartInternalStorage"
        | "FlowChartDocument"
        | "FlowChartMultidocument"
        | "FlowChartTerminator"
        | "FlowChartPreparation"
        | "FlowChartManualInput"
        | "FlowChartManualOperation"
        | "FlowChartConnector"
        | "FlowChartPunchedCard"
        | "FlowChartPunchedTape"
        | "FlowChartSummingJunction"
        | "FlowChartOr"
        | "FlowChartCollate"
        | "FlowChartSort"
        | "FlowChartExtract"
        | "FlowChartMerge"
        | "FlowChartOfflineStorage"
        | "FlowChartOnlineStorage"
        | "FlowChartMagneticTape"
        | "FlowChartMagneticDisk"
        | "FlowChartMagneticDrum"
        | "FlowChartDisplay"
        | "FlowChartDelay"
        | "FlowChartAlternateProcess"
        | "FlowChartOffpageConnector"
        | "ActionButtonBlank"
        | "ActionButtonHome"
        | "ActionButtonHelp"
        | "ActionButtonInformation"
        | "ActionButtonForwardNext"
        | "ActionButtonBackPrevious"
        | "ActionButtonEnd"
        | "ActionButtonBeginning"
        | "ActionButtonReturn"
        | "ActionButtonDocument"
        | "ActionButtonSound"
        | "ActionButtonMovie"
        | "Gear6"
        | "Gear9"
        | "Funnel"
        | "MathPlus"
        | "MathMinus"
        | "MathMultiply"
        | "MathDivide"
        | "MathEqual"
        | "MathNotEqual"
        | "CornerTabs"
        | "SquareTabs"
        | "PlaqueTabs"
        | "ChartX"
        | "ChartStar"
        | "ChartPlus",
      options?: PowerPoint.ShapeAddOptions,
    ): PowerPoint.Shape;
    /**
     * Create a shape group for several shapes.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param values - An array of shape IDs or `Shape` objects.
     * @returns A `Shape` object that represents the shape group. Use the `Shape.group` property to access the `ShapeGroup` object for the group.
     */
    addGroup(values: Array<string | Shape>): PowerPoint.Shape;
    /**
     * Adds a line to the slide. Returns a `Shape` object that represents the new line.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     *
     * @param connectorType - Specifies the connector type of the line. If not provided, `straight` connector type will be used. See {@link PowerPoint.ConnectorType} for details.
     * @param options - An optional parameter to specify the additional options such as the position of the shape object that contains the line.
     * @returns The newly inserted shape.
     */
    addLine(
      connectorType?: PowerPoint.ConnectorType,
      options?: PowerPoint.ShapeAddOptions,
    ): PowerPoint.Shape;
    /**
     * Adds a line to the slide. Returns a `Shape` object that represents the new line.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     *
     * @param connectorType - Specifies the connector type of the line. If not provided, `straight` connector type will be used. See {@link PowerPoint.ConnectorType} for details.
     * @param options - An optional parameter to specify the additional options such as the position of the shape object that contains the line.
     * @returns The newly inserted shape.
     */
    addLine(
      connectorType?: "Straight" | "Elbow" | "Curve",
      options?: PowerPoint.ShapeAddOptions,
    ): PowerPoint.Shape;
    /**
         * Adds a table to the slide. Returns a `Shape` object that represents the new table.
                    Use the `Shape.table` property to get the `Table` object for the shape.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         *
         * @param rowCount - Number of rows in the table. Must be 1 or greater.
         * @param columnCount - Number of columns in the table. Must be 1 or greater.
         * @param options - Provides options describing the new table.
         * @returns The newly inserted shape.
         */
    addTable(
      rowCount: number,
      columnCount: number,
      options?: PowerPoint.TableAddOptions,
    ): PowerPoint.Shape;
    /**
     * Adds a text box to the slide with the provided text as the content. Returns a `Shape` object that represents the new text box.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     *
     * @param text - Specifies the text that will be shown in the created text box.
     * @param options - An optional parameter to specify the additional options such as the position of the text box.
     * @returns The newly inserted shape.
     */
    addTextBox(
      text: string,
      options?: PowerPoint.ShapeAddOptions,
    ): PowerPoint.Shape;
    /**
     * Gets the number of shapes in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     * @returns The number of shapes in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a shape using its unique ID. An error is thrown if the shape doesn't exist.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param key - The ID of the shape.
     * @returns The shape with the unique ID. If such a shape doesn't exist, an error is thrown.
     */
    getItem(key: string): PowerPoint.Shape;
    /**
     * Gets a shape using its zero-based index in the collection. An error is thrown if the index is out of range.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param index - The index of the shape in the collection.
     * @returns The shape at the given index. An error is thrown if index is out of range.
     */
    getItemAt(index: number): PowerPoint.Shape;
    /**
     * Gets a shape using its unique ID. If such a shape doesn't exist, an object with an `isNullObject` property set to true is returned. For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param id - The ID of the shape.
     * @returns The shape with the unique ID. If such a shape doesn't exist, an object with an `isNullObject` property set to true is returned.
     */
    getItemOrNullObject(id: string): PowerPoint.Shape;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.ShapeCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.ShapeCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.ShapeCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.ShapeCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.ShapeCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ShapeCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.ShapeCollectionData;
  }
  /**
   * Specifies the gradient fill type for a {@link PowerPoint.SlideBackgroundGradientFill}.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  enum SlideBackgroundGradientFillType {
    /**
     * Unsupported gradient fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    unsupported = "Unsupported",
    /**
     * Linear gradient fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    linear = "Linear",
    /**
     * Radial gradient fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    radial = "Radial",
    /**
     * Rectangular gradient fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    rectangular = "Rectangular",
    /**
     * Path gradient fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    path = "Path",
    /**
     * Shade from title gradient fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    shadeFromTitle = "ShadeFromTitle",
  }
  /**
   * Represents {@link PowerPoint.SlideBackground} gradient fill properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class SlideBackgroundGradientFill extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies the type of gradient fill.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    type:
      | PowerPoint.SlideBackgroundGradientFillType
      | "Unsupported"
      | "Linear"
      | "Radial"
      | "Rectangular"
      | "Path"
      | "ShadeFromTitle";
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideBackgroundGradientFillLoadOptions,
    ): PowerPoint.SlideBackgroundGradientFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(
      propertyNames?: string | string[],
    ): PowerPoint.SlideBackgroundGradientFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideBackgroundGradientFill;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideBackgroundGradientFill` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideBackgroundGradientFillData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideBackgroundGradientFillData;
  }
  /**
   * Represents the available options for setting a {@link PowerPoint.SlideBackground} gradient fill.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export interface SlideBackgroundGradientFillOptions {
    /**
     * If provided, specifies the type of gradient fill.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    type?:
      | PowerPoint.SlideBackgroundGradientFillType
      | "Unsupported"
      | "Linear"
      | "Radial"
      | "Rectangular"
      | "Path"
      | "ShadeFromTitle";
  }
  /**
   * Specifies the pattern fill type for a {@link PowerPoint.SlideBackgroundPatternFill}.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  enum SlideBackgroundPatternFillType {
    /**
     * Unsupported pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    unsupported = "Unsupported",
    /**
     * 5 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent5 = "Percent5",
    /**
     * 10 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent10 = "Percent10",
    /**
     * 20 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent20 = "Percent20",
    /**
     * 25 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent25 = "Percent25",
    /**
     * 30 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent30 = "Percent30",
    /**
     * 40 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent40 = "Percent40",
    /**
     * 50 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent50 = "Percent50",
    /**
     * 60 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent60 = "Percent60",
    /**
     * 70 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent70 = "Percent70",
    /**
     * 75 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent75 = "Percent75",
    /**
     * 80 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent80 = "Percent80",
    /**
     * 90 percent pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    percent90 = "Percent90",
    /**
     * Horizontal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    horizontal = "Horizontal",
    /**
     * Vertical pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    vertical = "Vertical",
    /**
     * Light horizontal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    lightHorizontal = "LightHorizontal",
    /**
     * Light vertical pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    lightVertical = "LightVertical",
    /**
     * Dark horizontal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    darkHorizontal = "DarkHorizontal",
    /**
     * Dark vertical pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    darkVertical = "DarkVertical",
    /**
     * Narrow horizontal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    narrowHorizontal = "NarrowHorizontal",
    /**
     * Narrow vertical pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    narrowVertical = "NarrowVertical",
    /**
     * Dashed horizontal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    dashedHorizontal = "DashedHorizontal",
    /**
     * Dashed vertical pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    dashedVertical = "DashedVertical",
    /**
     * Cross pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    cross = "Cross",
    /**
     * Downward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    downwardDiagonal = "DownwardDiagonal",
    /**
     * Upward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    upwardDiagonal = "UpwardDiagonal",
    /**
     * Light downward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    lightDownwardDiagonal = "LightDownwardDiagonal",
    /**
     * Light upward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    lightUpwardDiagonal = "LightUpwardDiagonal",
    /**
     * Dark downward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    darkDownwardDiagonal = "DarkDownwardDiagonal",
    /**
     * Dark upward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    darkUpwardDiagonal = "DarkUpwardDiagonal",
    /**
     * Wide downward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    wideDownwardDiagonal = "WideDownwardDiagonal",
    /**
     * Wide upward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    wideUpwardDiagonal = "WideUpwardDiagonal",
    /**
     * Dashed downward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    dashedDownwardDiagonal = "DashedDownwardDiagonal",
    /**
     * Dashed upward diagonal pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    dashedUpwardDiagonal = "DashedUpwardDiagonal",
    /**
     * Diagonal cross pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    diagonalCross = "DiagonalCross",
    /**
     * Small checker board pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    smallCheckerBoard = "SmallCheckerBoard",
    /**
     * Large checker board pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    largeCheckerBoard = "LargeCheckerBoard",
    /**
     * Small grid pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    smallGrid = "SmallGrid",
    /**
     * Large grid pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    largeGrid = "LargeGrid",
    /**
     * Dotted grid pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    dottedGrid = "DottedGrid",
    /**
     * Small confetti pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    smallConfetti = "SmallConfetti",
    /**
     * Large confetti pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    largeConfetti = "LargeConfetti",
    /**
     * Horizontal brick pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    horizontalBrick = "HorizontalBrick",
    /**
     * Diagonal brick pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    diagonalBrick = "DiagonalBrick",
    /**
     * Solid diamond pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    solidDiamond = "SolidDiamond",
    /**
     * Outlined diamond pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    outlinedDiamond = "OutlinedDiamond",
    /**
     * Dotted diamond pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    dottedDiamond = "DottedDiamond",
    /**
     * Plaid pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    plaid = "Plaid",
    /**
     * Sphere pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    sphere = "Sphere",
    /**
     * Weave pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    weave = "Weave",
    /**
     * Divot pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    divot = "Divot",
    /**
     * Shingle pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    shingle = "Shingle",
    /**
     * Wave pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    wave = "Wave",
    /**
     * Trellis pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    trellis = "Trellis",
    /**
     * Zig zag pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    zigZag = "ZigZag",
  }
  /**
   * Represents {@link PowerPoint.SlideBackground} pattern fill properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class SlideBackgroundPatternFill extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies the background color in HTML color format (e.g., "#FFFFFF" or "white").
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    backgroundColor: string;
    /**
     * Specifies the foreground color in HTML color format (e.g., "#FFA500" or "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    foregroundColor: string;
    /**
     * Specifies the pattern type.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    pattern:
      | PowerPoint.SlideBackgroundPatternFillType
      | "Unsupported"
      | "Percent5"
      | "Percent10"
      | "Percent20"
      | "Percent25"
      | "Percent30"
      | "Percent40"
      | "Percent50"
      | "Percent60"
      | "Percent70"
      | "Percent75"
      | "Percent80"
      | "Percent90"
      | "Horizontal"
      | "Vertical"
      | "LightHorizontal"
      | "LightVertical"
      | "DarkHorizontal"
      | "DarkVertical"
      | "NarrowHorizontal"
      | "NarrowVertical"
      | "DashedHorizontal"
      | "DashedVertical"
      | "Cross"
      | "DownwardDiagonal"
      | "UpwardDiagonal"
      | "LightDownwardDiagonal"
      | "LightUpwardDiagonal"
      | "DarkDownwardDiagonal"
      | "DarkUpwardDiagonal"
      | "WideDownwardDiagonal"
      | "WideUpwardDiagonal"
      | "DashedDownwardDiagonal"
      | "DashedUpwardDiagonal"
      | "DiagonalCross"
      | "SmallCheckerBoard"
      | "LargeCheckerBoard"
      | "SmallGrid"
      | "LargeGrid"
      | "DottedGrid"
      | "SmallConfetti"
      | "LargeConfetti"
      | "HorizontalBrick"
      | "DiagonalBrick"
      | "SolidDiamond"
      | "OutlinedDiamond"
      | "DottedDiamond"
      | "Plaid"
      | "Sphere"
      | "Weave"
      | "Divot"
      | "Shingle"
      | "Wave"
      | "Trellis"
      | "ZigZag";
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideBackgroundPatternFillLoadOptions,
    ): PowerPoint.SlideBackgroundPatternFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(
      propertyNames?: string | string[],
    ): PowerPoint.SlideBackgroundPatternFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideBackgroundPatternFill;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideBackgroundPatternFill` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideBackgroundPatternFillData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideBackgroundPatternFillData;
  }
  /**
   * Represents the available options for setting a {@link PowerPoint.SlideBackground} pattern fill.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export interface SlideBackgroundPatternFillOptions {
    /**
     * If provided, specifies the background color in HTML color format (e.g., "#FFFFFF" or "white").
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    backgroundColor?: string;
    /**
     * If provided, specifies the foreground color in HTML color format (e.g., "#FFA500" or "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    foregroundColor?: string;
    /**
     * If provided, specifies the pattern type.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    pattern?:
      | PowerPoint.SlideBackgroundPatternFillType
      | "Unsupported"
      | "Percent5"
      | "Percent10"
      | "Percent20"
      | "Percent25"
      | "Percent30"
      | "Percent40"
      | "Percent50"
      | "Percent60"
      | "Percent70"
      | "Percent75"
      | "Percent80"
      | "Percent90"
      | "Horizontal"
      | "Vertical"
      | "LightHorizontal"
      | "LightVertical"
      | "DarkHorizontal"
      | "DarkVertical"
      | "NarrowHorizontal"
      | "NarrowVertical"
      | "DashedHorizontal"
      | "DashedVertical"
      | "Cross"
      | "DownwardDiagonal"
      | "UpwardDiagonal"
      | "LightDownwardDiagonal"
      | "LightUpwardDiagonal"
      | "DarkDownwardDiagonal"
      | "DarkUpwardDiagonal"
      | "WideDownwardDiagonal"
      | "WideUpwardDiagonal"
      | "DashedDownwardDiagonal"
      | "DashedUpwardDiagonal"
      | "DiagonalCross"
      | "SmallCheckerBoard"
      | "LargeCheckerBoard"
      | "SmallGrid"
      | "LargeGrid"
      | "DottedGrid"
      | "SmallConfetti"
      | "LargeConfetti"
      | "HorizontalBrick"
      | "DiagonalBrick"
      | "SolidDiamond"
      | "OutlinedDiamond"
      | "DottedDiamond"
      | "Plaid"
      | "Sphere"
      | "Weave"
      | "Divot"
      | "Shingle"
      | "Wave"
      | "Trellis"
      | "ZigZag";
  }
  /**
   * Represents {@link PowerPoint.SlideBackground} picture or texture fill properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class SlideBackgroundPictureOrTextureFill extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    transparency: number;
    /**
     * Sets the image used to fill.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param base64EncodedImage - A string that is a Base64 encoding of the image data.
     */
    setImage(base64EncodedImage: string): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideBackgroundPictureOrTextureFillLoadOptions,
    ): PowerPoint.SlideBackgroundPictureOrTextureFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(
      propertyNames?: string | string[],
    ): PowerPoint.SlideBackgroundPictureOrTextureFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideBackgroundPictureOrTextureFill;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideBackgroundPictureOrTextureFill` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideBackgroundPictureOrTextureFillData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideBackgroundPictureOrTextureFillData;
  }
  /**
   * Represents {@link PowerPoint.SlideBackground} picture or texture fill options.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export interface SlideBackgroundPictureOrTextureFillOptions {
    /**
     * If provided, specifies the Base64-encoded image data for the fill.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    imageBase64?: string;
    /**
     * If provided, specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    transparency: number;
  }
  /**
   * Specifies the fill type for a {@link PowerPoint.SlideBackground}.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  enum SlideBackgroundFillType {
    /**
     * Unsupported slide background fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    unsupported = "Unsupported",
    /**
     * Specifies that the slide background should have regular solid fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    solid = "Solid",
    /**
     * Specifies that the slide background should have gradient fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    gradient = "Gradient",
    /**
     * Specifies that the slide background should have picture or texture fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    pictureOrTexture = "PictureOrTexture",
    /**
     * Specifies that the slide background should have pattern fill.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    pattern = "Pattern",
  }
  /**
   * Represents {@link PowerPoint.SlideBackground} solid fill properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class SlideBackgroundSolidFill extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies the fill color in HTML color format (e.g., "#FFA500" or "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    color: string;
    /**
     * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    transparency: number;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideBackgroundSolidFillLoadOptions,
    ): PowerPoint.SlideBackgroundSolidFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(
      propertyNames?: string | string[],
    ): PowerPoint.SlideBackgroundSolidFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideBackgroundSolidFill;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideBackgroundSolidFill` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideBackgroundSolidFillData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideBackgroundSolidFillData;
  }
  /**
   * Represents the available options for setting a {@link PowerPoint.SlideBackground} solid fill.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export interface SlideBackgroundSolidFillOptions {
    /**
     * If provided, specifies the fill color in HTML color format (e.g., "#FFA500" or "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    color?: string;
    /**
     * If provided, specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    transparency?: number;
  }
  /**
   * Represents the fill formatting of a slide background object.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class SlideBackgroundFill extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns the fill type of the slide background. See {@link PowerPoint.SlideBackgroundFillType} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly type:
      | PowerPoint.SlideBackgroundFillType
      | "Unsupported"
      | "Solid"
      | "Gradient"
      | "PictureOrTexture"
      | "Pattern";
    /**
         * Gets the gradient fill properties. If the fill type is not `gradient`, an object with an `isNullObject` property set to `true` is returned.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    getGradientFillOrNullObject(): PowerPoint.SlideBackgroundGradientFill;
    /**
         * Gets the pattern fill properties. If the fill type is not `pattern`, an object with an `isNullObject` property set to `true` is returned.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    getPatternFillOrNullObject(): PowerPoint.SlideBackgroundPatternFill;
    /**
         * Gets the picture or texture fill properties. If the fill type is not `pictureOrTexture`, an object with an `isNullObject` property set to `true` is returned.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    getPictureOrTextureFillOrNullObject(): PowerPoint.SlideBackgroundPictureOrTextureFill;
    /**
         * Gets the solid fill properties. If the fill type is not `solid`, an object with an `isNullObject` property set to `true` is returned.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    getSolidFillOrNullObject(): PowerPoint.SlideBackgroundSolidFill;
    /**
     * Sets the fill formatting of the slide background to a gradient fill. This changes the fill type to `gradient`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param options - Options for the gradient fill.
     */
    setGradientFill(
      options?: PowerPoint.SlideBackgroundGradientFillOptions,
    ): void;
    /**
     * Sets the fill formatting of the slide background to a pattern fill. This changes the fill type to `pattern`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param options - Options for the pattern fill.
     */
    setPatternFill(
      options?: PowerPoint.SlideBackgroundPatternFillOptions,
    ): void;
    /**
     * Sets the fill formatting of the slide background to a picture or texture fill. This changes the fill type to `pictureOrTexture`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param options - Options for the picture or texture fill.
     */
    setPictureOrTextureFill(
      options?: PowerPoint.SlideBackgroundPictureOrTextureFillOptions,
    ): void;
    /**
     * Sets the fill formatting of the slide background to a solid fill. This changes the fill type to `solid`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param options - Options for the solid fill.
     */
    setSolidFill(options?: PowerPoint.SlideBackgroundSolidFillOptions): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideBackgroundFillLoadOptions,
    ): PowerPoint.SlideBackgroundFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideBackgroundFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideBackgroundFill;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideBackgroundFill` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideBackgroundFillData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideBackgroundFillData;
  }
  /**
   * Represents a background of a slide.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class SlideBackground extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns the fill formatting of the background.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly fill: PowerPoint.SlideBackgroundFill;
    /**
     * Specifies whether the slide layout background fill hides or displays background graphic objects from the slide master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    areBackgroundGraphicsHidden: boolean;
    /**
     * Specifies if the slide background follows the slide master background.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    isMasterBackgroundFollowed: boolean;
    /**
     * Resets the fill formatting of the slide background.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    reset(): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideBackgroundLoadOptions,
    ): PowerPoint.SlideBackground;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideBackground;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideBackground;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideBackground` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideBackgroundData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideBackgroundData;
  }
  /**
   * Represents the available options when getting an image of a slide.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export interface SlideGetImageOptions {
    /**
     * The desired height of the resulting image in pixels.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    height?: number;
    /**
     * The desired width of the resulting image in pixels.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    width?: number;
  }
  /**
   * Represents the background of a slide layout.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class SlideLayoutBackground extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns the fill formatting of the background.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly fill: PowerPoint.SlideBackgroundFill;
    /**
     * Specifies whether the slide layout background fill hides or displays background graphic objects from the slide master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    areBackgroundGraphicsHidden: boolean;
    /**
     * Specifies if the slide layout background follows the slide master background.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    isMasterBackgroundFollowed: boolean;
    /**
     * Resets the fill formatting of the slide layout background.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    reset(): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideLayoutBackgroundLoadOptions,
    ): PowerPoint.SlideLayoutBackground;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideLayoutBackground;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideLayoutBackground;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideLayoutBackground` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideLayoutBackgroundData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideLayoutBackgroundData;
  }
  /**
   * Specifies the type of a slide layout.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  enum SlideLayoutType {
    /**
     * Blank layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    blank = "Blank",
    /**
     * Chart layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    chart = "Chart",
    /**
     * Chart and text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    chartAndText = "ChartAndText",
    /**
     * ClipArt and text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    clipArtAndText = "ClipArtAndText",
    /**
     * ClipArt and vertical text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    clipArtAndVerticalText = "ClipArtAndVerticalText",
    /**
     * Comparison layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    comparison = "Comparison",
    /**
     * Content with caption layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    contentWithCaption = "ContentWithCaption",
    /**
     * Custom layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    custom = "Custom",
    /**
     * Four objects layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    fourObjects = "FourObjects",
    /**
     * Large object layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    largeObject = "LargeObject",
    /**
     * MediaClip and text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    mediaClipAndText = "MediaClipAndText",
    /**
     * Mixed layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    mixed = "Mixed",
    /**
     * Object layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    object = "Object",
    /**
     * Object and text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    objectAndText = "ObjectAndText",
    /**
     * Object and two objects layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    objectAndTwoObjects = "ObjectAndTwoObjects",
    /**
     * Object over text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    objectOverText = "ObjectOverText",
    /**
     * Organization chart layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    organizationChart = "OrganizationChart",
    /**
     * Picture with caption layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    pictureWithCaption = "PictureWithCaption",
    /**
     * Section header layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    sectionHeader = "SectionHeader",
    /**
     * Table layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    table = "Table",
    /**
     * Text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    text = "Text",
    /**
     * Text and chart layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    textAndChart = "TextAndChart",
    /**
     * Text and ClipArt layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    textAndClipArt = "TextAndClipArt",
    /**
     * Text and MediaClip layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    textAndMediaClip = "TextAndMediaClip",
    /**
     * Text and object layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    textAndObject = "TextAndObject",
    /**
     * Text and two objects layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    textAndTwoObjects = "TextAndTwoObjects",
    /**
     * Text over object layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    textOverObject = "TextOverObject",
    /**
     * Title layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    title = "Title",
    /**
     * Title only layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    titleOnly = "TitleOnly",
    /**
     * Two-column text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    twoColumnText = "TwoColumnText",
    /**
     * Two objects layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    twoObjects = "TwoObjects",
    /**
     * Two objects and object layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    twoObjectsAndObject = "TwoObjectsAndObject",
    /**
     * Two objects and text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    twoObjectsAndText = "TwoObjectsAndText",
    /**
     * Two objects over text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    twoObjectsOverText = "TwoObjectsOverText",
    /**
     * Vertical text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    verticalText = "VerticalText",
    /**
     * Vertical title and text layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    verticalTitleAndText = "VerticalTitleAndText",
    /**
     * Vertical title and text over chart layout.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    verticalTitleAndTextOverChart = "VerticalTitleAndTextOverChart",
  }
  /**
   * Specifies the theme colors used in PowerPoint.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  enum ThemeColor {
    /**
     * Specifies a mixed theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    mixed = "Mixed",
    /**
     * Specifies no theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    none = "None",
    /**
     * Specifies the Accent 1 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    accent1 = "Accent1",
    /**
     * Specifies the Accent 2 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    accent2 = "Accent2",
    /**
     * Specifies the Accent 3 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    accent3 = "Accent3",
    /**
     * Specifies the Accent 4 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    accent4 = "Accent4",
    /**
     * Specifies the Accent 5 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    accent5 = "Accent5",
    /**
     * Specifies the Accent 6 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    accent6 = "Accent6",
    /**
     * Specifies the Dark 1 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    dark1 = "Dark1",
    /**
     * Specifies the Dark 2 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    dark2 = "Dark2",
    /**
     * Specifies the clicked hyperlink theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    followedHyperlink = "FollowedHyperlink",
    /**
     * Specifies the hyperlink theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    hyperlink = "Hyperlink",
    /**
     * Specifies the Light 1 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    light1 = "Light1",
    /**
     * Specifies the Light 2 theme color.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    light2 = "Light2",
  }
  /**
   * Represents a theme color scheme.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class ThemeColorScheme extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Gets the color value for the specified `ThemeColor`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param color - The theme color.
     * @returns The color value in #RRGGBB format (e.g., "FFA500").
     */
    getThemeColor(
      color: PowerPoint.ThemeColor,
    ): OfficeExtension.ClientResult<string>;
    /**
     * Gets the color value for the specified `ThemeColor`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param color - The theme color.
     * @returns The color value in #RRGGBB format (e.g., "FFA500").
     */
    getThemeColor(
      color:
        | "Mixed"
        | "None"
        | "Accent1"
        | "Accent2"
        | "Accent3"
        | "Accent4"
        | "Accent5"
        | "Accent6"
        | "Dark1"
        | "Dark2"
        | "FollowedHyperlink"
        | "Hyperlink"
        | "Light1"
        | "Light2",
    ): OfficeExtension.ClientResult<string>;
    /**
     * Sets the color value for the specified `ThemeColor`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param color - The theme color.
     * @param rgbColor - The color value in #RRGGBB format (e.g., "FFA500") or as a named HTML color (e.g., "orange").
     */
    setThemeColor(color: PowerPoint.ThemeColor, rgbColor: string): void;
    /**
     * Sets the color value for the specified `ThemeColor`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param color - The theme color.
     * @param rgbColor - The color value in #RRGGBB format (e.g., "FFA500") or as a named HTML color (e.g., "orange").
     */
    setThemeColor(
      color:
        | "Mixed"
        | "None"
        | "Accent1"
        | "Accent2"
        | "Accent3"
        | "Accent4"
        | "Accent5"
        | "Accent6"
        | "Dark1"
        | "Dark2"
        | "FollowedHyperlink"
        | "Hyperlink"
        | "Light1"
        | "Light2",
      rgbColor: string,
    ): void;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.ThemeColorScheme` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ThemeColorSchemeData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): {
      [key: string]: string;
    };
  }
  /**
   * Represents the layout of a slide.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export class SlideLayout extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Gets the background of the slide layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly background: PowerPoint.SlideLayoutBackground;
    /**
     * Returns a collection of custom XML parts in the slide layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly customXmlParts: PowerPoint.CustomXmlPartCollection;
    /**
     * Returns a collection of shapes in the slide layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly shapes: PowerPoint.ShapeCollection;
    /**
     * Returns the `ThemeColorScheme` of the slide layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly themeColorScheme: PowerPoint.ThemeColorScheme;
    /**
     * Gets the unique ID of the slide layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly id: string;
    /**
     * Gets the name of the slide layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly name: string;
    /**
     * Returns the type of the slide layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly type:
      | PowerPoint.SlideLayoutType
      | "Blank"
      | "Chart"
      | "ChartAndText"
      | "ClipArtAndText"
      | "ClipArtAndVerticalText"
      | "Comparison"
      | "ContentWithCaption"
      | "Custom"
      | "FourObjects"
      | "LargeObject"
      | "MediaClipAndText"
      | "Mixed"
      | "Object"
      | "ObjectAndText"
      | "ObjectAndTwoObjects"
      | "ObjectOverText"
      | "OrganizationChart"
      | "PictureWithCaption"
      | "SectionHeader"
      | "Table"
      | "Text"
      | "TextAndChart"
      | "TextAndClipArt"
      | "TextAndMediaClip"
      | "TextAndObject"
      | "TextAndTwoObjects"
      | "TextOverObject"
      | "Title"
      | "TitleOnly"
      | "TwoColumnText"
      | "TwoObjects"
      | "TwoObjectsAndObject"
      | "TwoObjectsAndText"
      | "TwoObjectsOverText"
      | "VerticalText"
      | "VerticalTitleAndText"
      | "VerticalTitleAndTextOverChart";
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideLayoutLoadOptions,
    ): PowerPoint.SlideLayout;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideLayout;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideLayout;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideLayout` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideLayoutData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideLayoutData;
  }
  /**
   * Represents the collection of layouts provided by the Slide Master for slides.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export class SlideLayoutCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.SlideLayout[];
    /**
     * Gets the number of layouts in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     * @returns The number of layouts in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a layout using its unique ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param key - The ID of the layout.
     * @returns The layout with the unique ID. If such a layout doesn't exist, an error is thrown.
     */
    getItem(key: string): PowerPoint.SlideLayout;
    /**
     * Gets a layout using its zero-based index in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param index - The index of the layout in the collection.
     * @returns The layout at the given index. An error is thrown if index is out of range.
     */
    getItemAt(index: number): PowerPoint.SlideLayout;
    /**
         * Gets a layout using its unique ID. If such a layout doesn't exist, an object with an `isNullObject` property set to true is returned. For further information,
                    see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.3]
         *
         * @param id - The ID of the layout.
         * @returns The layout with the unique ID.
         */
    getItemOrNullObject(id: string): PowerPoint.SlideLayout;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideLayoutCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.SlideLayoutCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideLayoutCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.SlideLayoutCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideLayoutCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideLayoutCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.SlideLayoutCollectionData;
  }
  /**
   * Represents the background of a slide master.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class SlideMasterBackground extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns the fill formatting of the background.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly fill: PowerPoint.SlideBackgroundFill;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideMasterBackgroundLoadOptions,
    ): PowerPoint.SlideMasterBackground;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideMasterBackground;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideMasterBackground;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideMasterBackground` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideMasterBackgroundData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideMasterBackgroundData;
  }
  /**
   * Represents the Slide Master of a slide.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export class SlideMaster extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Gets the background of the Slide Master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly background: PowerPoint.SlideMasterBackground;
    /**
     * Returns a collection of custom XML parts in the Slide Master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly customXmlParts: PowerPoint.CustomXmlPartCollection;
    /**
     * Gets the collection of layouts provided by the Slide Master for slides.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly layouts: PowerPoint.SlideLayoutCollection;
    /**
     * Returns a collection of shapes in the Slide Master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly shapes: PowerPoint.ShapeCollection;
    /**
     * Returns the `ThemeColorScheme` of the Slide Master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly themeColorScheme: PowerPoint.ThemeColorScheme;
    /**
     * Gets the unique ID of the Slide Master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly id: string;
    /**
     * Gets the unique name of the Slide Master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly name: string;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideMasterLoadOptions,
    ): PowerPoint.SlideMaster;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideMaster;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.SlideMaster;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideMaster` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideMasterData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideMasterData;
  }
  /**
   * Represents a single tag in the slide.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export class Tag extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Gets the unique ID of the tag. The `key` is unique within the owning `TagCollection` and always stored as uppercase letters within the document.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly key: string;
    /**
     * Gets the value of the tag.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    value: string;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(options?: PowerPoint.Interfaces.TagLoadOptions): PowerPoint.Tag;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Tag;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Tag;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Tag` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TagData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.TagData;
  }
  /**
   * Represents the collection of tags.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export class TagCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.Tag[];
    /**
     * Adds a new tag at the end of the collection. If the `key` already exists in the collection, the value of the existing tag will be replaced with the given `value`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param key - The unique ID of a tag, which is unique within this `TagCollection`. 'key' parameter is case-insensitive, but it's always capitalized when saved in the document.
     * @param value - The value of the tag.
     */
    add(key: string, value: string): void;
    /**
     * Deletes the tag with the given `key` in this collection. Does nothing if the `key` doesn't exist.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param key - The unique ID of a tag, which is unique within this `TagCollection`. `key` parameter is case-insensitive.
     */
    delete(key: string): void;
    /**
     * Gets the number of tags in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     * @returns The number of tags in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a tag using its unique ID. An error is thrown if the tag doesn't exist.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param key - The ID of the tag.
     * @returns The tag with the unique ID. If such a tag doesn't exist, an error is thrown.
     */
    getItem(key: string): PowerPoint.Tag;
    /**
     * Gets a tag using its zero-based index in the collection. An error is thrown if the index is out of range.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param index - The index of the tag in the collection.
     * @returns The tag at the given index. An error is thrown if index is out of range.
     */
    getItemAt(index: number): PowerPoint.Tag;
    /**
     * Gets a tag using its unique ID. If such a tag doesn't exist, an object with an `isNullObject` property set to true is returned. For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param key - The ID of the tag.
     * @returns The tag with the unique ID. If such a tag doesn't exist, an object with an `isNullObject` property set to true is returned.
     */
    getItemOrNullObject(key: string): PowerPoint.Tag;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.TagCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.TagCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.TagCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.TagCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.TagCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.TagCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.TagCollectionData;
  }
  /**
   * Represents a single slide of a presentation.
   *
   * @remarks
   * [Api set: PowerPointApi 1.2]
   */
  export class Slide extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Gets the background of the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly background: PowerPoint.SlideBackground;
    /**
     * Returns a collection of custom XML parts in the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly customXmlParts: PowerPoint.CustomXmlPartCollection;
    /**
     * Returns a collection of hyperlinks in the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.6]
     */
    readonly hyperlinks: PowerPoint.HyperlinkCollection;
    /**
     * Gets the layout of the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly layout: PowerPoint.SlideLayout;
    /**
     * Returns a collection of shapes in the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly shapes: PowerPoint.ShapeCollection;
    /**
     * Gets the `SlideMaster` object that represents the slide's default content.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly slideMaster: PowerPoint.SlideMaster;
    /**
     * Returns a collection of tags in the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly tags: PowerPoint.TagCollection;
    /**
     * Returns the `ThemeColorScheme` of the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly themeColorScheme: PowerPoint.ThemeColorScheme;
    /**
     * Gets the unique ID of the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.2]
     */
    readonly id: string;
    /**
     * Returns the zero-based index of the slide representing its position in the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly index: number;
    /**
     * Applies the specified layout to the slide, changing its design and structure according to the chosen layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param slideLayout - The layout to be applied to the slide. This is typically an instance of a predefined layout from the slide master.
     */
    applyLayout(slideLayout: PowerPoint.SlideLayout): void;
    /**
     * Deletes the slide from the presentation. Does nothing if the slide doesn't exist.
     *
     * @remarks
     * [Api set: PowerPointApi 1.2]
     */
    delete(): void;
    /**
         * Exports the slide to its own presentation file, returned as Base64-encoded data.
                    
                    Note: This method is optimized to export a single slide. Exporting multiple slides can impact performance.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    exportAsBase64(): OfficeExtension.ClientResult<string>;
    /**
         * Renders an image of the slide. The image is scaled to fit into the desired dimensions.
                    If width and height aren't specified, the true size of the slide is used. If only one
                    of either width or height is specified, the other will be calculated to preserve aspect ratio.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         *
         * @param options - Optional. Options to specify the desired size of the slide image.
         * @returns A Base64-encoded string of the slide image in PNG format.
         */
    getImageAsBase64(
      options?: PowerPoint.SlideGetImageOptions,
    ): OfficeExtension.ClientResult<string>;
    /**
     * Moves the slide to a new position within the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param slideIndex - The zero-based index where the slide should be moved.
     */
    moveTo(slideIndex: number): void;
    /**
     * Selects the specified shapes. Existing shape selection is replaced with the new selection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     *
     * @param shapeIds - List of shape IDs to select in the slide. If the list is empty, the selection is cleared.
     */
    setSelectedShapes(shapeIds: string[]): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(options?: PowerPoint.Interfaces.SlideLoadOptions): PowerPoint.Slide;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Slide;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Slide;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Slide` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.SlideData;
  }
  /**
   * Represents the format of an image.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  enum ShapeGetImageFormatType {
    /**
     * The picture is in PNG format.
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    png = "Png",
  }
  /**
     * Represents the available options when getting an image of a shape.
                The image is scaled to fit into the desired dimensions. If width and height aren't specified, the true size of the shape is used.
                If only one of either width or height is specified, the other will be calculated to preserve aspect ratio.
                The resulting dimensions will automatically be clamped to the maximum supported size if too large.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
  export interface ShapeGetImageOptions {
    /**
     * The desired format of the resulting image.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    format?: PowerPoint.ShapeGetImageFormatType | "Png";
    /**
         * The desired height of the resulting image in pixels. This value will automatically be clamped to the maximum supported size if too large.
                    Throws an `InvalidArgument` exception when set with a non-positive integer.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    height?: number;
    /**
         * The desired width of the resulting image in pixels. This value will automatically be clamped to the maximum supported size if too large.
                    Throws an `InvalidArgument` exception when set with a non-positive integer.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    width?: number;
  }
  /**
   * Represents a shape group inside a presentation. To get the corresponding Shape object, use `ShapeGroup.shape`.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export class ShapeGroup extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns the `Shape` object associated with the group.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly shape: PowerPoint.Shape;
    /**
     * Returns the collection of `Shape` objects in the group.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly shapes: PowerPoint.ShapeScopedCollection;
    /**
     * Gets the creation ID of the shape group. Returns `null` if the shape group has no creation ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly creationId: string | null;
    /**
     * Gets the unique ID of the shape group.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly id: string;
    /**
     * Ungroups any grouped shapes in the specified shape group.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    ungroup(): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.ShapeGroupLoadOptions,
    ): PowerPoint.ShapeGroup;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.ShapeGroup;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.ShapeGroup;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.ShapeGroup` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ShapeGroupData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.ShapeGroupData;
  }
  /**
   * Specifies the style for a line.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  enum ShapeLineStyle {
    /**
     * Single line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    single = "Single",
    /**
     * Thick line with a thin line on each side.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    thickBetweenThin = "ThickBetweenThin",
    /**
     * Thick line next to thin line. For horizontal lines, the thick line is above the thin line. For vertical lines, the thick line is to the left of the thin line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    thickThin = "ThickThin",
    /**
     * Thick line next to thin line. For horizontal lines, the thick line is below the thin line. For vertical lines, the thick line is to the right of the thin line.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    thinThick = "ThinThick",
    /**
     * Two thin lines.
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    thinThin = "ThinThin",
  }
  /**
   * Represents the line formatting for the shape object. For images and geometric shapes, line formatting represents the border of the shape.
   *
   * @remarks
   * [Api set: PowerPointApi 1.4]
   */
  export class ShapeLineFormat extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Represents the line color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    color: string;
    /**
     * Represents the dash style of the line. Returns null when the line isn't visible or there are inconsistent dash styles. See {@link PowerPoint.ShapeLineDashStyle} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    dashStyle:
      | PowerPoint.ShapeLineDashStyle
      | "Dash"
      | "DashDot"
      | "DashDotDot"
      | "LongDash"
      | "LongDashDot"
      | "RoundDot"
      | "Solid"
      | "SquareDot"
      | "LongDashDotDot"
      | "SystemDash"
      | "SystemDot"
      | "SystemDashDot";
    /**
     * Represents the line style of the shape. Returns null when the line isn't visible or there are inconsistent styles. See {@link PowerPoint.ShapeLineStyle} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    style:
      | PowerPoint.ShapeLineStyle
      | "Single"
      | "ThickBetweenThin"
      | "ThickThin"
      | "ThinThick"
      | "ThinThin";
    /**
     * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear). Returns null when the shape has inconsistent transparencies.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    transparency: number;
    /**
     * Specifies if the line formatting of a shape element is visible. Returns `null` when the shape has inconsistent visibilities.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    visible: boolean;
    /**
     * Represents the weight of the line, in points. Returns `null` when the line isn't visible or there are inconsistent line weights.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    weight: number;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.ShapeLineFormatLoadOptions,
    ): PowerPoint.ShapeLineFormat;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.ShapeLineFormat;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.ShapeLineFormat;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.ShapeLineFormat` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ShapeLineFormatData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.ShapeLineFormatData;
  }
  /**
   * Use with `setZOrder` to move the specified shape up or down the collection's z-order, which shifts it in front of or behind other shapes.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  enum ShapeZOrder {
    /**
     * Brings the shape forward one spot in the z-order.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    bringForward = "BringForward",
    /**
     * Brings the shape to the front of the z-order.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    bringToFront = "BringToFront",
    /**
     * Sends the shape backward one spot in the z-order.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    sendBackward = "SendBackward",
    /**
     * Sends the shape to the back of the z-order.
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    sendToBack = "SendToBack",
  }
  /**
   * Represents a single shape in the slide.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export class Shape extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Returns an `Adjustments` object that contains adjustment values for all the adjustments in this shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly adjustments: PowerPoint.Adjustments;
    /**
     * Returns a collection of custom XML parts in the shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly customXmlParts: PowerPoint.CustomXmlPartCollection;
    /**
     * Returns the fill formatting of this shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly fill: PowerPoint.ShapeFill;
    /**
         * Returns the `ShapeGroup` associated with the shape.
                    If the shape type isn't `group`, then this method returns the `GeneralException` error.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    readonly group: PowerPoint.ShapeGroup;
    /**
     * Returns the line formatting of this shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly lineFormat: PowerPoint.ShapeLineFormat;
    /**
         * Returns the parent group of this shape.
                    If the shape isn't part of a group, then this method returns the `GeneralException` error.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    readonly parentGroup: PowerPoint.Shape;
    /**
         * Returns the properties that apply specifically to this placeholder.
                    If the shape type isn't `placeholder`, then this method returns the `GeneralException` error.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    readonly placeholderFormat: PowerPoint.PlaceholderFormat;
    /**
     * Returns a collection of tags in the shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly tags: PowerPoint.TagCollection;
    /**
     * Returns the {@link PowerPoint.TextFrame} object of this `Shape`. Throws an `InvalidArgument` exception if the shape doesn't support a `TextFrame`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly textFrame: PowerPoint.TextFrame;
    /**
         * The alt text description of the Shape.
                    
                    Alt text provides alternative, text-based representations of the information contained in the Shape.
                    This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    altTextDescription: string;
    /**
         * The alt text title of the Shape.
                    
                    Alt text provides alternative, text-based representations of the information contained in the Shape.
                    This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
                    A title can be read to a person with a disability and is used to determine whether they wish to hear the description of the content.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    altTextTitle: string;
    /**
     * Gets the creation ID of the shape. Returns `null` if the shape has no creation ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    readonly creationId: string | null;
    /**
     * Specifies the height, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    height: number;
    /**
     * Gets the unique ID of the shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    readonly id: string;
    /**
         * Represents whether the shape is decorative or not.
                    
                    Decorative objects add visual interest but aren't informative (e.g. stylistic borders).
                    People using screen readers will hear these are decorative so they know they aren't missing any important information.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    isDecorative: boolean;
    /**
     * The distance, in points, from the left side of the shape to the left side of the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    left: number;
    /**
         * Returns the level of the specified shape.
                    
                    - A level of 0 means the shape isn't part of a group.
                    
                    - A level of 1 means the shape is part of a top-level group.
                    
                    - A level greater than 1 indicates the shape is a nested group.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    readonly level: number;
    /**
     * Specifies the name of this shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    name: string;
    /**
         * Specifies the rotation, in degrees, of the shape around the z-axis.
                    A positive value indicates clockwise rotation, and a negative value indicates counterclockwise rotation.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    rotation: number;
    /**
     * The distance, in points, from the top edge of the shape to the top edge of the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    top: number;
    /**
     * Returns the type of this shape. See {@link PowerPoint.ShapeType} for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    readonly type:
      | PowerPoint.ShapeType
      | "Unsupported"
      | "Image"
      | "GeometricShape"
      | "Group"
      | "Line"
      | "Table"
      | "Callout"
      | "Chart"
      | "ContentApp"
      | "Diagram"
      | "Freeform"
      | "Graphic"
      | "Ink"
      | "Media"
      | "Model3D"
      | "Ole"
      | "Placeholder"
      | "SmartArt"
      | "TextBox";
    /**
     * Specifies if the shape is visible.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    visible: boolean;
    /**
     * Specifies the width, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    width: number;
    /**
         * Returns the z-order position of the shape, with 0 representing the bottom of the order stack. Every shape on a slide has a unique z-order, but
                    each slide also has a unique z-order stack, so two shapes on separate slides could have the same z-order number.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         */
    readonly zOrderPosition: number;
    /**
     * Deletes the shape from the shape collection. Does nothing if the shape doesn't exist.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    delete(): void;
    /**
     * Renders an image of the shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param options - Optional. Options to specify the desired output image properties.
     * @returns A Base64-encoded string of the shape image in the specified format.
     */
    getImageAsBase64(
      options?: PowerPoint.ShapeGetImageOptions,
    ): OfficeExtension.ClientResult<string>;
    /**
     * Returns the parent {@link PowerPoint.Slide} object that holds this `Shape`. Throws an exception if this shape doesn't belong to a `Slide`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    getParentSlide(): PowerPoint.Slide;
    /**
     * Returns the parent {@link PowerPoint.SlideLayout} object that holds this `Shape`. Throws an exception if this shape doesn't belong to a `SlideLayout`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    getParentSlideLayout(): PowerPoint.SlideLayout;
    /**
     * Returns the parent {@link PowerPoint.SlideLayout} object that holds this `Shape`. If this shape doesn't belong to a `SlideLayout`, an object with an `isNullObject` property set to `true` is returned. For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    getParentSlideLayoutOrNullObject(): PowerPoint.SlideLayout;
    /**
     * Returns the parent {@link PowerPoint.SlideMaster} object that holds this `Shape`. Throws an exception if this shape doesn't belong to a `SlideMaster`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    getParentSlideMaster(): PowerPoint.SlideMaster;
    /**
     * Returns the parent {@link PowerPoint.SlideMaster} object that holds this `Shape`. If this shape doesn't belong to a `SlideMaster`, an object with an `isNullObject` property set to `true` is returned. For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    getParentSlideMasterOrNullObject(): PowerPoint.SlideMaster;
    /**
     * Returns the parent {@link PowerPoint.Slide} object that holds this `Shape`. If this shape doesn't belong to a `Slide`, an object with an `isNullObject` property set to `true` is returned. For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    getParentSlideOrNullObject(): PowerPoint.Slide;
    /**
     * Returns the `Table` object if this shape is a table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    getTable(): PowerPoint.Table;
    /**
         * Returns the {@link PowerPoint.TextFrame} object of this `Shape`. If the shape doesn't support a `TextFrame`, an object with an `isNullObject` property set to `true` is returned.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         */
    getTextFrameOrNullObject(): PowerPoint.TextFrame;
    /**
     * Sets a hyperlink on this `Shape` with the specified options. This will delete any existing hyperlink on this `Shape`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     *
     * @param options - Optional. The options for the hyperlink.
     * @returns The newly created {@link PowerPoint.Hyperlink} object.
     */
    setHyperlink(
      options?: PowerPoint.HyperlinkAddOptions,
    ): PowerPoint.Hyperlink;
    /**
     * Moves the specified shape up or down the collection's z-order, which shifts it in front of or behind other shapes.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param position - Specifies how to move the shape within the z-order stack. Uses the `ShapeZOrder` enum.
     */
    setZOrder(position: PowerPoint.ShapeZOrder): void;
    /**
     * Moves the specified shape up or down the collection's z-order, which shifts it in front of or behind other shapes.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param position - Specifies how to move the shape within the z-order stack. Uses the `ShapeZOrder` enum.
     */
    setZOrder(
      position: "BringForward" | "BringToFront" | "SendBackward" | "SendToBack",
    ): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(options?: PowerPoint.Interfaces.ShapeLoadOptions): PowerPoint.Shape;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Shape;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Shape;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Shape` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.ShapeData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.ShapeData;
  }
  /**
   * Represents an Office.js binding that is defined in the presentation.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export class Binding extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Represents the binding identifier.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly id: string;
    /**
     * Returns the type of the binding. See `BindingType` for details.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    readonly type: PowerPoint.BindingType | "Shape";
    /**
     * Deletes the binding.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    delete(): void;
    /**
     * Returns the shape represented by the binding. Throws an error if the binding isn't of the correct type.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    getShape(): PowerPoint.Shape;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.BindingLoadOptions,
    ): PowerPoint.Binding;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.Binding;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.Binding;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.Binding` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.BindingData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.BindingData;
  }
  /**
   * Represents the collection of all the binding objects that are part of the presentation.
   *
   * @remarks
   * [Api set: PowerPointApi 1.8]
   */
  export class BindingCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.Binding[];
    /**
     * Adds a new binding to a particular Shape. If the provided ID is already being used by a binding, the existing binding will be overwritten.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param shape - Shape to which the binding is added.
     * @param bindingType - Type of binding. See `BindingType`.
     * @param id - ID of the binding.
     */
    add(
      shape: PowerPoint.Shape,
      bindingType: PowerPoint.BindingType,
      id: string,
    ): PowerPoint.Binding;
    /**
     * Adds a new binding to a particular Shape. If the provided ID is already being used by a binding, the existing binding will be overwritten.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param shape - Shape to which the binding is added.
     * @param bindingType - Type of binding. See `BindingType`.
     * @param id - ID of the binding.
     */
    add(
      shape: PowerPoint.Shape,
      bindingType: "Shape",
      id: string,
    ): PowerPoint.Binding;
    /**
         * Adds a new binding based on the current selection.
                             If the selection has multiple areas, the `InvalidReference` error will be returned.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         *
         * @param bindingType - Type of binding. See `BindingType`.
         * @param id - ID of the binding.
         */
    addFromSelection(
      bindingType: PowerPoint.BindingType,
      id: string,
    ): PowerPoint.Binding;
    /**
         * Adds a new binding based on the current selection.
                             If the selection has multiple areas, the `InvalidReference` error will be returned.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         *
         * @param bindingType - Type of binding. See `BindingType`.
         * @param id - ID of the binding.
         */
    addFromSelection(bindingType: "Shape", id: string): PowerPoint.Binding;
    /**
     * Gets the number of bindings in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a binding object by ID. Throws an ItemNotFoundException if there's no binding with that ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param key - ID of the binding object to be retrieved.
     */
    getItem(key: string): PowerPoint.Binding;
    /**
     * Gets a binding object based on its position in the items array. Throws an InvalidArgumentException if the index less than 0, or greater than or equal to the count of items in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     *
     * @param index - Index value of the object to be retrieved. Zero-indexed.
     */
    getItemAt(index: number): PowerPoint.Binding;
    /**
         * Gets a binding object by ID. If the binding object doesn't exist, then this method returns an object with its `isNullObject` property set to `true`.
                             For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.8]
         *
         * @param id - ID of the binding object to be retrieved.
         */
    getItemOrNullObject(id: string): PowerPoint.Binding;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.BindingCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.BindingCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.BindingCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.BindingCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.BindingCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.BindingCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.BindingCollectionData;
  }
  /**
   * Specifies the document property type for custom properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.7]
   */
  enum DocumentPropertyType {
    /**
     * The Boolean document property type.
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    boolean = "Boolean",
    /**
     * The Date document property type.
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    date = "Date",
    /**
     * The Number document property type.
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    number = "Number",
    /**
     * The String document property type.
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    string = "String",
  }
  /**
   * Represents a custom property.
   *
   * @remarks
   * [Api set: PowerPointApi 1.7]
   */
  export class CustomProperty extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * The string that uniquely identifies the custom property.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly key: string;
    /**
     * The type of the value used for the custom property.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly type:
      | PowerPoint.DocumentPropertyType
      | "Boolean"
      | "Date"
      | "Number"
      | "String";
    /**
         * The value of the custom property.
                    If the value is a string, the maximum length 255 characters. Larger strings cause the operation to fail with an `InvalidArgument` error.
         *
         * @remarks
         * [Api set: PowerPointApi 1.7]
         */
    value: boolean | Date | number | string;
    /**
     * Deletes the custom property.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    delete(): void;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.CustomPropertyLoadOptions,
    ): PowerPoint.CustomProperty;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.CustomProperty;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.CustomProperty;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.CustomProperty` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.CustomPropertyData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.CustomPropertyData;
  }
  /**
   * A collection of custom properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.7]
   */
  export class CustomPropertyCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.CustomProperty[];
    /**
     * Creates a new `CustomProperty` or updates the property with the given key.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     *
     * @param key - The string that identifies the `CustomProperty` object. It's case-insensitive.
     * The maximum key length is 255 characters. Larger strings cause the operation to fail with an `InvalidArgument` error.
     * @param value - The value of the `CustomProperty`.
     * If the value is a string, the maximum length 255 characters. Larger strings cause the operation to fail with an `InvalidArgument` error.
     */
    add(
      key: string,
      value: boolean | Date | number | string,
    ): PowerPoint.CustomProperty;
    /**
     * Deletes all custom properties in this collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    deleteAll(): void;
    /**
     * Gets the number of custom properties in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     * @returns The number of custom properties in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a `CustomProperty` by its key.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     *
     * @param key - The string that identifies the `CustomProperty` object. It's case-insensitive.
     * Keys have a maximum length of 255 characters. If the argument exceeds 255 characters, then this method returns the `InvalidArgument` error.
     */
    getItem(key: string): PowerPoint.CustomProperty;
    /**
         * Gets a `CustomProperty` by its zero-based index in the collection.
                    Throws an `InvalidArgument` exception when the index is out of range.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         *
         * @param index - The index of the custom property in the collection.
         * @returns The custom property at the given index.
         */
    getItemAt(index: number): PowerPoint.CustomProperty;
    /**
         * Gets a `CustomProperty` by its key.
                    If the `CustomProperty` doesn't exist, then this method returns an object with its `isNullObject` property set to `true`.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.7]
         *
         * @param key - The string that identifies the `CustomProperty` object. It's case-insensitive.
         * Keys have a maximum length of 255 characters. If the argument exceeds 255 characters, then this method returns the `InvalidArgument` error.
         */
    getItemOrNullObject(key: string): PowerPoint.CustomProperty;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.CustomPropertyCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.CustomPropertyCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(
      propertyNames?: string | string[],
    ): PowerPoint.CustomPropertyCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.CustomPropertyCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.CustomPropertyCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.CustomPropertyCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.CustomPropertyCollectionData;
  }
  /**
   * Represents presentation properties.
   *
   * @remarks
   * [Api set: PowerPointApi 1.7]
   */
  export class DocumentProperties extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * The collection of custom properties of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly customProperties: PowerPoint.CustomPropertyCollection;
    /**
     * The author of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    author: string;
    /**
     * The category of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    category: string;
    /**
     * The Comments field in the metadata of the presentation. These have no connection to comments made in slides.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    comments: string;
    /**
     * The company of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    company: string;
    /**
     * The creation date of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly creationDate: Date;
    /**
     * The keywords of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    keywords: string;
    /**
     * The last author of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    readonly lastAuthor: string;
    /**
     * The manager of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    manager: string;
    /**
     * The revision number of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    revisionNumber: number;
    /**
     * The subject of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    subject: string;
    /**
     * The title of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    title: string;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.DocumentPropertiesLoadOptions,
    ): PowerPoint.DocumentProperties;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.DocumentProperties;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.DocumentProperties;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.DocumentProperties` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.DocumentPropertiesData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.DocumentPropertiesData;
  }
  /**
   * Specifies the formatting options for when slides are inserted.
   *
   * @remarks
   * [Api set: PowerPointApi 1.2]
   */
  enum InsertSlideFormatting {
    /**
     * Copy the source theme into the target presentation and use that theme.
     * @remarks
     * [Api set: PowerPointApi 1.2]
     */
    keepSourceFormatting = "KeepSourceFormatting",
    /**
     * Use the existing theme in the target presentation.
     * @remarks
     * [Api set: PowerPointApi 1.2]
     */
    useDestinationTheme = "UseDestinationTheme",
  }
  /**
   * Represents the available options when inserting slides.
   *
   * @remarks
   * [Api set: PowerPointApi 1.2]
   */
  export interface InsertSlideOptions {
    /**
         * Specifies which formatting to use during slide insertion.
                    The default option is to use "KeepSourceFormatting".
         *
         * @remarks
         * [Api set: PowerPointApi 1.2]
         */
    formatting?:
      | PowerPoint.InsertSlideFormatting
      | "KeepSourceFormatting"
      | "UseDestinationTheme";
    /**
         * Specifies the slides from the source presentation that will be inserted into the current presentation. These slides are represented by their IDs which can be retrieved from a `Slide` object.
                    The order of these slides is preserved during the insertion.
                    If any of the source slides aren't found, or if the IDs are invalid, the operation throws a `SlideNotFound` exception and no slides will be inserted.
                    All of the source slides will be inserted when `sourceSlideIds` isn't provided (this is the default behavior).
         *
         * @remarks
         * [Api set: PowerPointApi 1.2]
         */
    sourceSlideIds?: string[];
    /**
         * Specifies where in the presentation the new slides will be inserted. The new slides will be inserted after the slide with the given slide ID.
                    If `targetSlideId` isn't provided, the slides will be inserted at the beginning of the presentation.
                    If `targetSlideId` is invalid or if it's pointing to a non-existing slide, the operation throws a `SlideNotFound` exception and no slides will be inserted.
         *
         * @remarks
         * [Api set: PowerPointApi 1.2]
         */
    targetSlideId?: string;
  }
  /**
   * Represents the page setup information for the presentation.
   *
   * @remarks
   * [Api set: PowerPointApi 1.10]
   */
  export class PageSetup extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /**
     * Specifies the height of the slides in the presentation, in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    slideHeight: number;
    /**
     * Specifies the width of the slides in the presentation, in points.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    slideWidth: number;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.PageSetupLoadOptions,
    ): PowerPoint.PageSetup;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.PageSetup;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(propertyNamesAndPaths?: {
      select?: string;
      expand?: string;
    }): PowerPoint.PageSetup;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.PageSetup` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.PageSetupData`) that contains shallow copies of any loaded child properties from the original object.
     */
    toJSON(): PowerPoint.Interfaces.PageSetupData;
  }
  /**
   * Represents the collection of slides in the presentation.
   *
   * @remarks
   * [Api set: PowerPointApi 1.2]
   */
  export class SlideCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.Slide[];
    /**
     * Adds a new slide to the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param options - Optional. Options for configuring the properties of the new slide.
     */
    add(options?: PowerPoint.AddSlideOptions): void;
    /**
         * Exports one or more slides found in this collection to their own presentation file, returned as Base64-encoded data.
                    Throws an `InvalidArgument` exception if provided slide IDs or `Slide` objects are not found in this collection.
         *
         * @remarks
         * [Api set: PowerPointApi 1.10]
         *
         * @param values - An array of slide IDs or `Slide` objects.
         * @returns A Base64-encoded string.
         */
    exportAsBase64Presentation(
      values: Array<string | Slide>,
    ): OfficeExtension.ClientResult<string>;
    /**
     * Gets the number of slides in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.2]
     * @returns The number of slides in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a slide using its unique ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.2]
     *
     * @param key - The ID of the slide.
     * @returns The slide with the unique ID. If such a slide doesn't exist, an error is thrown.
     */
    getItem(key: string): PowerPoint.Slide;
    /**
         * Gets a slide using its zero-based index in the collection. Slides are stored in the same order as they
                    are shown in the presentation.
         *
         * @remarks
         * [Api set: PowerPointApi 1.2]
         *
         * @param index - The index of the slide in the collection.
         * @returns The slide at the given index. An error is thrown if index is out of range.
         */
    getItemAt(index: number): PowerPoint.Slide;
    /**
         * Gets a slide using its unique ID. If such a slide doesn't exist, an object with an `isNullObject` property set to true is returned. For further information, see
                    {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.2]
         *
         * @param id - The ID of the slide.
         * @returns The slide with the unique ID.
         */
    getItemOrNullObject(id: string): PowerPoint.Slide;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.SlideCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.SlideCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.SlideCollectionData;
  }
  /**
   * Represents a collection of slides in the presentation.
   *
   * @remarks
   * [Api set: PowerPointApi 1.5]
   */
  export class SlideScopedCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.Slide[];
    /**
     * Exports all slides in this collection to their own presentation file, returned as Base64-encoded data.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     * @returns A Base64-encoded string.
     */
    exportAsBase64Presentation(): OfficeExtension.ClientResult<string>;
    /**
     * Gets the number of slides in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     * @returns The number of slides in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a slide using its unique ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     *
     * @param key - The ID of the slide.
     * @returns The slide with the unique ID. If such a slide doesn't exist, an error is thrown.
     */
    getItem(key: string): PowerPoint.Slide;
    /**
     * Gets a slide using its zero-based index in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     *
     * @param index - The index of the slide in the collection.
     * @returns The slide at the given index. An error is thrown if index is out of range.
     */
    getItemAt(index: number): PowerPoint.Slide;
    /**
         * Gets a slide using its unique ID. If such a slide doesn't exist, an object with an `isNullObject` property set to true is returned. For further information, see
                    {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.5]
         *
         * @param id - The ID of the slide.
         * @returns The slide with the unique ID.
         */
    getItemOrNullObject(id: string): PowerPoint.Slide;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideScopedCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.SlideScopedCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideScopedCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.SlideScopedCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideScopedCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideScopedCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.SlideScopedCollectionData;
  }
  /**
   * Represents the collection of Slide Masters in the presentation.
   *
   * @remarks
   * [Api set: PowerPointApi 1.3]
   */
  export class SlideMasterCollection extends OfficeExtension.ClientObject {
    /** The request context associated with the object. This connects the add-in's process to the Office host application's process. */
    context: RequestContext;
    /** Gets the loaded child items in this collection. */
    readonly items: PowerPoint.SlideMaster[];
    /**
     * Gets the number of Slide Masters in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     * @returns The number of Slide Masters in the collection.
     */
    getCount(): OfficeExtension.ClientResult<number>;
    /**
     * Gets a Slide Master using its unique ID.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param key - The ID of the Slide Master.
     * @returns The Slide Master with the unique ID. If such a Slide Master doesn't exist, an error is thrown.
     */
    getItem(key: string): PowerPoint.SlideMaster;
    /**
     * Gets a Slide Master using its zero-based index in the collection.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     *
     * @param index - The index of the Slide Master in the collection.
     * @returns The Slide Master at the given index. An error is thrown if index is out of range.
     */
    getItemAt(index: number): PowerPoint.SlideMaster;
    /**
         * Gets a Slide Master using its unique ID. If such a Slide Master doesn't exist, an object with an `isNullObject` property set to true is returned.
                    For further information, see {@link https://learn.microsoft.com/office/dev/add-ins/develop/application-specific-api-model#ornullobject-methods-and-properties | *OrNullObject methods and properties}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.3]
         *
         * @param id - The ID of the Slide Master.
         * @returns The Slide Master with the unique ID.
         */
    getItemOrNullObject(id: string): PowerPoint.SlideMaster;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param options - Provides options for which properties of the object to load.
     */
    load(
      options?: PowerPoint.Interfaces.SlideMasterCollectionLoadOptions &
        PowerPoint.Interfaces.CollectionLoadOptions,
    ): PowerPoint.SlideMasterCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNames - A comma-delimited string or an array of strings that specify the properties to load.
     */
    load(propertyNames?: string | string[]): PowerPoint.SlideMasterCollection;
    /**
     * Queues up a command to load the specified properties of the object. You must call `context.sync()` before reading the properties.
     *
     * @param propertyNamesAndPaths - `propertyNamesAndPaths.select` is a comma-delimited string that specifies the properties to load, and `propertyNamesAndPaths.expand` is a comma-delimited string that specifies the navigation properties to load.
     */
    load(
      propertyNamesAndPaths?: OfficeExtension.LoadOption,
    ): PowerPoint.SlideMasterCollection;
    /**
     * Overrides the JavaScript `toJSON()` method in order to provide more useful output when an API object is passed to `JSON.stringify()`. (`JSON.stringify`, in turn, calls the `toJSON` method of the object that's passed to it.)
     * Whereas the original `PowerPoint.SlideMasterCollection` object is an API object, the `toJSON` method returns a plain JavaScript object (typed as `PowerPoint.Interfaces.SlideMasterCollectionData`) that contains an "items" array with shallow copies of any loaded properties from the collection's items.
     */
    toJSON(): PowerPoint.Interfaces.SlideMasterCollectionData;
  }
  enum ErrorCodes {
    generalException = "GeneralException",
  }
  export namespace Interfaces {
    /**
     * Provides ways to load properties of only a subset of members of a collection.
     */
    export interface CollectionLoadOptions {
      /**
       * Specify the number of items in the queried collection to be included in the result.
       */
      $top?: number;
      /**
       * Specify the number of items in the collection that are to be skipped and not included in the result. If `top` is specified, the selection of result will start after skipping the specified number of items.
       */
      $skip?: number;
    }
    /** An interface for updating data on the `CustomXmlPartScopedCollection` object, for use in `customXmlPartScopedCollection.set({ ... })`. */
    export interface CustomXmlPartScopedCollectionUpdateData {
      items?: PowerPoint.Interfaces.CustomXmlPartData[];
    }
    /** An interface for updating data on the `CustomXmlPartCollection` object, for use in `customXmlPartCollection.set({ ... })`. */
    export interface CustomXmlPartCollectionUpdateData {
      items?: PowerPoint.Interfaces.CustomXmlPartData[];
    }
    /** An interface for updating data on the `HyperlinkScopedCollection` object, for use in `hyperlinkScopedCollection.set({ ... })`. */
    export interface HyperlinkScopedCollectionUpdateData {
      items?: PowerPoint.Interfaces.HyperlinkData[];
    }
    /** An interface for updating data on the `BulletFormat` object, for use in `bulletFormat.set({ ... })`. */
    export interface BulletFormatUpdateData {
      /**
             * Specifies the style of the bullets in the paragraph. See {@link PowerPoint.BulletStyle} for details.
                        Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet formatting properties.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      style?:
        | PowerPoint.BulletStyle
        | "Unsupported"
        | "AlphabetLowercasePeriod"
        | "AlphabetUppercasePeriod"
        | "ArabicNumeralParenthesisRight"
        | "ArabicNumeralPeriod"
        | "RomanLowercaseParenthesesBoth"
        | "RomanLowercaseParenthesisRight"
        | "RomanLowercasePeriod"
        | "RomanUppercasePeriod"
        | "AlphabetLowercaseParenthesesBoth"
        | "AlphabetLowercaseParenthesisRight"
        | "AlphabetUppercaseParenthesesBoth"
        | "AlphabetUppercaseParenthesisRight"
        | "ArabicNumeralParenthesesBoth"
        | "ArabicNumeralPlain"
        | "RomanUppercaseParenthesesBoth"
        | "RomanUppercaseParenthesisRight"
        | "SimplifiedChinesePlain"
        | "SimplifiedChinesePeriod"
        | "CircleNumberDoubleBytePlain"
        | "CircleNumberWideDoubleByteWhitePlain"
        | "CircleNumberWideDoubleByteBlackPlain"
        | "TraditionalChinesePlain"
        | "TraditionalChinesePeriod"
        | "ArabicAlphabetDash"
        | "ArabicAbjadDash"
        | "HebrewAlphabetDash"
        | "KanjiKoreanPlain"
        | "KanjiKoreanPeriod"
        | "ArabicDoubleBytePlain"
        | "ArabicDoubleBytePeriod"
        | "ThaiAlphabetPeriod"
        | "ThaiAlphabetParenthesisRight"
        | "ThaiAlphabetParenthesesBoth"
        | "ThaiNumeralPeriod"
        | "ThaiNumeralParenthesisRight"
        | "ThaiNumeralParenthesesBoth"
        | "HindiAlphabetPeriod"
        | "HindiNumeralPeriod"
        | "KanjiSimplifiedChineseDoubleBytePeriod"
        | "HindiNumeralParenthesisRight"
        | "HindiAlphabet1Period"
        | null;
      /**
             * Specifies the type of the bullets in the paragraph. See {@link PowerPoint.BulletType} for details.
                        Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet formatting properties.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      type?:
        | PowerPoint.BulletType
        | "Unsupported"
        | "None"
        | "Numbered"
        | "Unnumbered"
        | null;
      /**
       * Specifies if the bullets in the paragraph are visible. Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet visibility values.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      visible?: boolean | null;
    }
    /** An interface for updating data on the `ParagraphFormat` object, for use in `paragraphFormat.set({ ... })`. */
    export interface ParagraphFormatUpdateData {
      /**
       * Represents the horizontal alignment of the paragraph. Returns 'null' if the 'TextRange' includes text fragments with different horizontal alignment values. See {@link PowerPoint.ParagraphHorizontalAlignment} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      horizontalAlignment?:
        | PowerPoint.ParagraphHorizontalAlignment
        | "Left"
        | "Center"
        | "Right"
        | "Justify"
        | "JustifyLow"
        | "Distributed"
        | "ThaiDistributed"
        | null;
      /**
       * Represents the indent level of the paragraph.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      indentLevel?: number;
    }
    /** An interface for updating data on the `ShapeFont` object, for use in `shapeFont.set({ ... })`. */
    export interface ShapeFontUpdateData {
      /**
             * Specifies whether the text in the `TextRange` is set to use the **All Caps** attribute which makes lowercase letters appear as uppercase letters. The possible values are as follows:
                        
                        - `true`: All the text has the **All Caps** attribute.
                        
                        - `false`: None of the text has the **All Caps** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **All Caps** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      allCaps?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to bold. The possible values are as follows:
                        
                        - `true`: All the text is bold.
                        
                        - `false`: None of the text is bold.
                        
                        - `null`: Returned if some, but not all, of the text is bold.
             *
             * @remarks
             * [Api set: PowerPointApi 1.4]
             */
      bold?: boolean | null;
      /**
       * Specifies the HTML color code representation of the text color (e.g., "#FF0000" represents red). Returns `null` if the `TextRange` contains text fragments with different colors.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      color?: string | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Double strikethrough** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Double strikethrough** attribute.
                        
                        - `false`: None of the text has the **Double strikethrough** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Double strikethrough** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      doubleStrikethrough?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to italic. The possible values are as follows:
                        
                        - `true`: All the text is italicized.
                        
                        - `false`: None of the text is italicized.
                        
                        - `null`: Returned if some, but not all, of the text is italicized.
             *
             * @remarks
             * [Api set: PowerPointApi 1.4]
             */
      italic?: boolean | null;
      /**
       * Specifies the font name (e.g., "Calibri"). If the text is a Complex Script or East Asian language, this is the corresponding font name; otherwise it's the Latin font name. Returns `null` if the `TextRange` contains text fragments with different font names.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      name?: string | null;
      /**
       * Specifies the font size in points (e.g., 11). Returns `null` if the `TextRange` contains text fragments with different font sizes.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      size?: number | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Small Caps** attribute which makes lowercase letters appear as small uppercase letters. The possible values are as follows:
                        
                        - `true`: All the text has the **Small Caps** attribute.
                        
                        - `false`: None of the text has the **Small Caps** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Small Caps** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      smallCaps?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Strikethrough** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Strikethrough** attribute.
                        
                        - `false`: None of the text has the **Strikethrough** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Strikethrough** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      strikethrough?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Subscript** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Subscript** attribute.
                        
                        - `false`: None of the text has the **Subscript** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Subscript** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      subscript?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Superscript** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Superscript** attribute.
                        
                        - `false`: None of the text has the **Superscript** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Superscript** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      superscript?: boolean | null;
      /**
       * Specifies the type of underline applied to the font. Returns `null` if the `TextRange` contains text fragments with different underline styles. See {@link PowerPoint.ShapeFontUnderlineStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      underline?:
        | PowerPoint.ShapeFontUnderlineStyle
        | "None"
        | "Single"
        | "Double"
        | "Heavy"
        | "Dotted"
        | "DottedHeavy"
        | "Dash"
        | "DashHeavy"
        | "DashLong"
        | "DashLongHeavy"
        | "DotDash"
        | "DotDashHeavy"
        | "DotDotDash"
        | "DotDotDashHeavy"
        | "Wavy"
        | "WavyHeavy"
        | "WavyDouble"
        | null;
    }
    /** An interface for updating data on the `TextFrame` object, for use in `textFrame.set({ ... })`. */
    export interface TextFrameUpdateData {
      /**
       * The automatic sizing settings for the text frame. A text frame can be set to automatically fit the text to the text frame, to automatically fit the text frame to the text, or not perform any automatic sizing.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      autoSizeSetting?:
        | PowerPoint.ShapeAutoSize
        | "AutoSizeNone"
        | "AutoSizeTextToFitShape"
        | "AutoSizeShapeToFitText"
        | "AutoSizeMixed";
      /**
       * Represents the bottom margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      bottomMargin?: number;
      /**
       * Represents the left margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      leftMargin?: number;
      /**
       * Represents the right margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      rightMargin?: number;
      /**
       * Represents the top margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      topMargin?: number;
      /**
       * Represents the vertical alignment of the text frame. See {@link PowerPoint.TextVerticalAlignment} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      verticalAlignment?:
        | PowerPoint.TextVerticalAlignment
        | "Top"
        | "Middle"
        | "Bottom"
        | "TopCentered"
        | "MiddleCentered"
        | "BottomCentered";
      /**
       * Determines whether lines break automatically to fit text inside the shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      wordWrap?: boolean;
    }
    /** An interface for updating data on the `TextRange` object, for use in `textRange.set({ ... })`. */
    export interface TextRangeUpdateData {
      /**
             * Gets or sets the length of the range that this `TextRange` represents.
                        Throws an `InvalidArgument` exception when set with a negative value or if the value is greater than the length of the available text from the starting point.
             *
             * @remarks
             * [Api set: PowerPointApi 1.5]
             */
      length?: number;
      /**
             * Gets or sets zero-based index, relative to the parent text frame, for the starting position of the range that this `TextRange` represents.
                        Throws an `InvalidArgument` exception when set with a negative value or if the value is greater than the length of the text.
             *
             * @remarks
             * [Api set: PowerPointApi 1.5]
             */
      start?: number;
      /**
       * Represents the plain text content of the text range.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      text?: string;
    }
    /** An interface for updating data on the `Hyperlink` object, for use in `hyperlink.set({ ... })`. */
    export interface HyperlinkUpdateData {
      /**
       * Specifies the address of the hyperlink, which can be a URL, a file name or file path, or an email address with the `mailto` URI scheme.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      address?: string;
      /**
       * Specifies the string displayed when hovering over the hyperlink.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      screenTip?: string;
    }
    /** An interface for updating data on the `HyperlinkCollection` object, for use in `hyperlinkCollection.set({ ... })`. */
    export interface HyperlinkCollectionUpdateData {
      items?: PowerPoint.Interfaces.HyperlinkData[];
    }
    /** An interface for updating data on the `ShapeScopedCollection` object, for use in `shapeScopedCollection.set({ ... })`. */
    export interface ShapeScopedCollectionUpdateData {
      items?: PowerPoint.Interfaces.ShapeData[];
    }
    /** An interface for updating data on the `Border` object, for use in `border.set({ ... })`. */
    export interface BorderUpdateData {
      /**
       * Represents the line color in the hexadecimal format #RRGGBB (e.g., "FFA500") or as a named HTML color value (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      color?: string | undefined;
      /**
       * Represents the dash style of the line.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      dashStyle?:
        | PowerPoint.ShapeLineDashStyle
        | "Dash"
        | "DashDot"
        | "DashDotDot"
        | "LongDash"
        | "LongDashDot"
        | "RoundDot"
        | "Solid"
        | "SquareDot"
        | "LongDashDotDot"
        | "SystemDash"
        | "SystemDot"
        | "SystemDashDot"
        | undefined;
      /**
       * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      transparency?: number | undefined;
      /**
       * Represents the weight of the line, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      weight?: number | undefined;
    }
    /** An interface for updating data on the `Margins` object, for use in `margins.set({ ... })`. */
    export interface MarginsUpdateData {
      /**
       * Specifies the bottom margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      bottom?: number | undefined;
      /**
       * Specifies the left margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      left?: number | undefined;
      /**
       * Specifies the right margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      right?: number | undefined;
      /**
       * Specifies the top margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      top?: number | undefined;
    }
    /** An interface for updating data on the `ShapeFill` object, for use in `shapeFill.set({ ... })`. */
    export interface ShapeFillUpdateData {
      /**
       * Represents the shape fill foreground color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      foregroundColor?: string;
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear). Returns `null` if the shape type doesn't support transparency or the shape fill has inconsistent transparency, such as with a gradient fill type.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      transparency?: number;
    }
    /** An interface for updating data on the `TableCell` object, for use in `tableCell.set({ ... })`. */
    export interface TableCellUpdateData {
      /**
       * Specifies the horizontal alignment of the text in the table cell. Returns `null` if the cell text contains different alignments.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      horizontalAlignment?:
        | PowerPoint.ParagraphHorizontalAlignment
        | "Left"
        | "Center"
        | "Right"
        | "Justify"
        | "JustifyLow"
        | "Distributed"
        | "ThaiDistributed"
        | null;
      /**
       * Specifies the indent level of the text in the table cell. Returns `null` if the cell text contains different indent levels.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      indentLevel?: number | null;
      /**
       * Specifies the text content of the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      text?: string;
      /**
             * Specifies the contents of the table cell as an array of {@link PowerPoint.TextRun} objects.
                        Each `TextRun` object represents a sequence of one or more characters that share the same font attributes.
             *
             * @remarks
             * [Api set: PowerPointApi 1.9]
             */
      textRuns?: PowerPoint.TextRun[];
      /**
       * Specifies the vertical alignment of the text in the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      verticalAlignment?:
        | PowerPoint.TextVerticalAlignment
        | "Top"
        | "Middle"
        | "Bottom"
        | "TopCentered"
        | "MiddleCentered"
        | "BottomCentered";
    }
    /** An interface for updating data on the `TableCellCollection` object, for use in `tableCellCollection.set({ ... })`. */
    export interface TableCellCollectionUpdateData {
      items?: PowerPoint.Interfaces.TableCellData[];
    }
    /** An interface for updating data on the `TableColumn` object, for use in `tableColumn.set({ ... })`. */
    export interface TableColumnUpdateData {
      /**
       * Retrieves the width of the column in points. If the set column width is less than the minimum width, the column width will be increased to the minimum width.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      width?: number;
    }
    /** An interface for updating data on the `TableColumnCollection` object, for use in `tableColumnCollection.set({ ... })`. */
    export interface TableColumnCollectionUpdateData {
      items?: PowerPoint.Interfaces.TableColumnData[];
    }
    /** An interface for updating data on the `TableRow` object, for use in `tableRow.set({ ... })`. */
    export interface TableRowUpdateData {
      /**
       * Specifies the height of the row in points. If the set row height is less than the minimum height, the row height will be increased to the minimum height.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      height?: number;
    }
    /** An interface for updating data on the `TableRowCollection` object, for use in `tableRowCollection.set({ ... })`. */
    export interface TableRowCollectionUpdateData {
      items?: PowerPoint.Interfaces.TableRowData[];
    }
    /** An interface for updating data on the `TableStyleSettings` object, for use in `tableStyleSettings.set({ ... })`. */
    export interface TableStyleSettingsUpdateData {
      /**
       * Specifies if the columns show banded formatting in which odd columns are highlighted differently from even ones, to make reading the table easier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      areColumnsBanded?: boolean;
      /**
       * Specifies if the rows show banded formatting in which odd rows are highlighted differently from even ones, to make reading the table easier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      areRowsBanded?: boolean;
      /**
       * Specifies if the first column contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isFirstColumnHighlighted?: boolean;
      /**
       * Specifies if the first row contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isFirstRowHighlighted?: boolean;
      /**
       * Specifies if the last column contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isLastColumnHighlighted?: boolean;
      /**
       * Specifies if the last row contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isLastRowHighlighted?: boolean;
      /**
       * Specifies the table style.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      style?:
        | PowerPoint.TableStyle
        | "NoStyleNoGrid"
        | "ThemedStyle1Accent1"
        | "ThemedStyle1Accent2"
        | "ThemedStyle1Accent3"
        | "ThemedStyle1Accent4"
        | "ThemedStyle1Accent5"
        | "ThemedStyle1Accent6"
        | "NoStyleTableGrid"
        | "ThemedStyle2Accent1"
        | "ThemedStyle2Accent2"
        | "ThemedStyle2Accent3"
        | "ThemedStyle2Accent4"
        | "ThemedStyle2Accent5"
        | "ThemedStyle2Accent6"
        | "LightStyle1"
        | "LightStyle1Accent1"
        | "LightStyle1Accent2"
        | "LightStyle1Accent3"
        | "LightStyle1Accent4"
        | "LightStyle1Accent5"
        | "LightStyle1Accent6"
        | "LightStyle2"
        | "LightStyle2Accent1"
        | "LightStyle2Accent2"
        | "LightStyle2Accent3"
        | "LightStyle2Accent4"
        | "LightStyle2Accent5"
        | "LightStyle2Accent6"
        | "LightStyle3"
        | "LightStyle3Accent1"
        | "LightStyle3Accent2"
        | "LightStyle3Accent3"
        | "LightStyle3Accent4"
        | "LightStyle3Accent5"
        | "LightStyle3Accent6"
        | "MediumStyle1"
        | "MediumStyle1Accent1"
        | "MediumStyle1Accent2"
        | "MediumStyle1Accent3"
        | "MediumStyle1Accent4"
        | "MediumStyle1Accent5"
        | "MediumStyle1Accent6"
        | "MediumStyle2"
        | "MediumStyle2Accent1"
        | "MediumStyle2Accent2"
        | "MediumStyle2Accent3"
        | "MediumStyle2Accent4"
        | "MediumStyle2Accent5"
        | "MediumStyle2Accent6"
        | "MediumStyle3"
        | "MediumStyle3Accent1"
        | "MediumStyle3Accent2"
        | "MediumStyle3Accent3"
        | "MediumStyle3Accent4"
        | "MediumStyle3Accent5"
        | "MediumStyle3Accent6"
        | "MediumStyle4"
        | "MediumStyle4Accent1"
        | "MediumStyle4Accent2"
        | "MediumStyle4Accent3"
        | "MediumStyle4Accent4"
        | "MediumStyle4Accent5"
        | "MediumStyle4Accent6"
        | "DarkStyle1"
        | "DarkStyle1Accent1"
        | "DarkStyle1Accent2"
        | "DarkStyle1Accent3"
        | "DarkStyle1Accent4"
        | "DarkStyle1Accent5"
        | "DarkStyle1Accent6"
        | "DarkStyle2"
        | "DarkStyle2Accent1"
        | "DarkStyle2Accent2"
        | "DarkStyle2Accent3";
    }
    /** An interface for updating data on the `ShapeCollection` object, for use in `shapeCollection.set({ ... })`. */
    export interface ShapeCollectionUpdateData {
      items?: PowerPoint.Interfaces.ShapeData[];
    }
    /** An interface for updating data on the `SlideBackgroundGradientFill` object, for use in `slideBackgroundGradientFill.set({ ... })`. */
    export interface SlideBackgroundGradientFillUpdateData {
      /**
       * Specifies the type of gradient fill.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?:
        | PowerPoint.SlideBackgroundGradientFillType
        | "Unsupported"
        | "Linear"
        | "Radial"
        | "Rectangular"
        | "Path"
        | "ShadeFromTitle";
    }
    /** An interface for updating data on the `SlideBackgroundPatternFill` object, for use in `slideBackgroundPatternFill.set({ ... })`. */
    export interface SlideBackgroundPatternFillUpdateData {
      /**
       * Specifies the background color in HTML color format (e.g., "#FFFFFF" or "white").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      backgroundColor?: string;
      /**
       * Specifies the foreground color in HTML color format (e.g., "#FFA500" or "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      foregroundColor?: string;
      /**
       * Specifies the pattern type.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      pattern?:
        | PowerPoint.SlideBackgroundPatternFillType
        | "Unsupported"
        | "Percent5"
        | "Percent10"
        | "Percent20"
        | "Percent25"
        | "Percent30"
        | "Percent40"
        | "Percent50"
        | "Percent60"
        | "Percent70"
        | "Percent75"
        | "Percent80"
        | "Percent90"
        | "Horizontal"
        | "Vertical"
        | "LightHorizontal"
        | "LightVertical"
        | "DarkHorizontal"
        | "DarkVertical"
        | "NarrowHorizontal"
        | "NarrowVertical"
        | "DashedHorizontal"
        | "DashedVertical"
        | "Cross"
        | "DownwardDiagonal"
        | "UpwardDiagonal"
        | "LightDownwardDiagonal"
        | "LightUpwardDiagonal"
        | "DarkDownwardDiagonal"
        | "DarkUpwardDiagonal"
        | "WideDownwardDiagonal"
        | "WideUpwardDiagonal"
        | "DashedDownwardDiagonal"
        | "DashedUpwardDiagonal"
        | "DiagonalCross"
        | "SmallCheckerBoard"
        | "LargeCheckerBoard"
        | "SmallGrid"
        | "LargeGrid"
        | "DottedGrid"
        | "SmallConfetti"
        | "LargeConfetti"
        | "HorizontalBrick"
        | "DiagonalBrick"
        | "SolidDiamond"
        | "OutlinedDiamond"
        | "DottedDiamond"
        | "Plaid"
        | "Sphere"
        | "Weave"
        | "Divot"
        | "Shingle"
        | "Wave"
        | "Trellis"
        | "ZigZag";
    }
    /** An interface for updating data on the `SlideBackgroundPictureOrTextureFill` object, for use in `slideBackgroundPictureOrTextureFill.set({ ... })`. */
    export interface SlideBackgroundPictureOrTextureFillUpdateData {
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      transparency?: number;
    }
    /** An interface for updating data on the `SlideBackgroundSolidFill` object, for use in `slideBackgroundSolidFill.set({ ... })`. */
    export interface SlideBackgroundSolidFillUpdateData {
      /**
       * Specifies the fill color in HTML color format (e.g., "#FFA500" or "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      color?: string;
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      transparency?: number;
    }
    /** An interface for updating data on the `SlideBackground` object, for use in `slideBackground.set({ ... })`. */
    export interface SlideBackgroundUpdateData {
      /**
       * Specifies whether the slide layout background fill hides or displays background graphic objects from the slide master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      areBackgroundGraphicsHidden?: boolean;
      /**
       * Specifies if the slide background follows the slide master background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      isMasterBackgroundFollowed?: boolean;
    }
    /** An interface for updating data on the `SlideLayoutBackground` object, for use in `slideLayoutBackground.set({ ... })`. */
    export interface SlideLayoutBackgroundUpdateData {
      /**
       * Specifies whether the slide layout background fill hides or displays background graphic objects from the slide master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      areBackgroundGraphicsHidden?: boolean;
      /**
       * Specifies if the slide layout background follows the slide master background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      isMasterBackgroundFollowed?: boolean;
    }
    /** An interface for updating data on the `SlideLayoutCollection` object, for use in `slideLayoutCollection.set({ ... })`. */
    export interface SlideLayoutCollectionUpdateData {
      items?: PowerPoint.Interfaces.SlideLayoutData[];
    }
    /** An interface for updating data on the `Tag` object, for use in `tag.set({ ... })`. */
    export interface TagUpdateData {
      /**
       * Gets the value of the tag.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      value?: string;
    }
    /** An interface for updating data on the `TagCollection` object, for use in `tagCollection.set({ ... })`. */
    export interface TagCollectionUpdateData {
      items?: PowerPoint.Interfaces.TagData[];
    }
    /** An interface for updating data on the `ShapeLineFormat` object, for use in `shapeLineFormat.set({ ... })`. */
    export interface ShapeLineFormatUpdateData {
      /**
       * Represents the line color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      color?: string;
      /**
       * Represents the dash style of the line. Returns null when the line isn't visible or there are inconsistent dash styles. See {@link PowerPoint.ShapeLineDashStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      dashStyle?:
        | PowerPoint.ShapeLineDashStyle
        | "Dash"
        | "DashDot"
        | "DashDotDot"
        | "LongDash"
        | "LongDashDot"
        | "RoundDot"
        | "Solid"
        | "SquareDot"
        | "LongDashDotDot"
        | "SystemDash"
        | "SystemDot"
        | "SystemDashDot";
      /**
       * Represents the line style of the shape. Returns null when the line isn't visible or there are inconsistent styles. See {@link PowerPoint.ShapeLineStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      style?:
        | PowerPoint.ShapeLineStyle
        | "Single"
        | "ThickBetweenThin"
        | "ThickThin"
        | "ThinThick"
        | "ThinThin";
      /**
       * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear). Returns null when the shape has inconsistent transparencies.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      transparency?: number;
      /**
       * Specifies if the line formatting of a shape element is visible. Returns `null` when the shape has inconsistent visibilities.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      visible?: boolean;
      /**
       * Represents the weight of the line, in points. Returns `null` when the line isn't visible or there are inconsistent line weights.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      weight?: number;
    }
    /** An interface for updating data on the `Shape` object, for use in `shape.set({ ... })`. */
    export interface ShapeUpdateData {
      /**
             * The alt text description of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextDescription?: string;
      /**
             * The alt text title of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
                        A title can be read to a person with a disability and is used to determine whether they wish to hear the description of the content.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextTitle?: string;
      /**
       * Specifies the height, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      height?: number;
      /**
             * Represents whether the shape is decorative or not.
                        
                        Decorative objects add visual interest but aren't informative (e.g. stylistic borders).
                        People using screen readers will hear these are decorative so they know they aren't missing any important information.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      isDecorative?: boolean;
      /**
       * The distance, in points, from the left side of the shape to the left side of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      left?: number;
      /**
       * Specifies the name of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      name?: string;
      /**
             * Specifies the rotation, in degrees, of the shape around the z-axis.
                        A positive value indicates clockwise rotation, and a negative value indicates counterclockwise rotation.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      rotation?: number;
      /**
       * The distance, in points, from the top edge of the shape to the top edge of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      top?: number;
      /**
       * Specifies if the shape is visible.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      visible?: boolean;
      /**
       * Specifies the width, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      width?: number;
    }
    /** An interface for updating data on the `BindingCollection` object, for use in `bindingCollection.set({ ... })`. */
    export interface BindingCollectionUpdateData {
      items?: PowerPoint.Interfaces.BindingData[];
    }
    /** An interface for updating data on the `CustomProperty` object, for use in `customProperty.set({ ... })`. */
    export interface CustomPropertyUpdateData {
      /**
             * The value of the custom property.
                        If the value is a string, the maximum length 255 characters. Larger strings cause the operation to fail with an `InvalidArgument` error.
             *
             * @remarks
             * [Api set: PowerPointApi 1.7]
             */
      value?: boolean | Date | number | string;
    }
    /** An interface for updating data on the `CustomPropertyCollection` object, for use in `customPropertyCollection.set({ ... })`. */
    export interface CustomPropertyCollectionUpdateData {
      items?: PowerPoint.Interfaces.CustomPropertyData[];
    }
    /** An interface for updating data on the `DocumentProperties` object, for use in `documentProperties.set({ ... })`. */
    export interface DocumentPropertiesUpdateData {
      /**
       * The author of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      author?: string;
      /**
       * The category of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      category?: string;
      /**
       * The Comments field in the metadata of the presentation. These have no connection to comments made in slides.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      comments?: string;
      /**
       * The company of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      company?: string;
      /**
       * The keywords of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      keywords?: string;
      /**
       * The manager of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      manager?: string;
      /**
       * The revision number of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      revisionNumber?: number;
      /**
       * The subject of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      subject?: string;
      /**
       * The title of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      title?: string;
    }
    /** An interface for updating data on the `PageSetup` object, for use in `pageSetup.set({ ... })`. */
    export interface PageSetupUpdateData {
      /**
       * Specifies the height of the slides in the presentation, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      slideHeight?: number;
      /**
       * Specifies the width of the slides in the presentation, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      slideWidth?: number;
    }
    /** An interface for updating data on the `SlideCollection` object, for use in `slideCollection.set({ ... })`. */
    export interface SlideCollectionUpdateData {
      items?: PowerPoint.Interfaces.SlideData[];
    }
    /** An interface for updating data on the `SlideScopedCollection` object, for use in `slideScopedCollection.set({ ... })`. */
    export interface SlideScopedCollectionUpdateData {
      items?: PowerPoint.Interfaces.SlideData[];
    }
    /** An interface for updating data on the `SlideMasterCollection` object, for use in `slideMasterCollection.set({ ... })`. */
    export interface SlideMasterCollectionUpdateData {
      items?: PowerPoint.Interfaces.SlideMasterData[];
    }
    /** An interface describing the data returned by calling `presentation.toJSON()`. */
    export interface PresentationData {
      /**
       * Gets the ID of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.5]
       */
      id?: string;
      /**
       * Returns the title of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.0]
       */
      title?: string;
    }
    /** An interface describing the data returned by calling `adjustments.toJSON()`. */
    export interface AdjustmentsData {
      /**
       * Specifies the number of adjustment points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      count?: number;
    }
    /** An interface describing the data returned by calling `customXmlPart.toJSON()`. */
    export interface CustomXmlPartData {
      /**
       * The ID of the custom XML part.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      id?: string;
      /**
       * The namespace URI of the custom XML part.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      namespaceUri?: string;
    }
    /** An interface describing the data returned by calling `customXmlPartScopedCollection.toJSON()`. */
    export interface CustomXmlPartScopedCollectionData {
      items?: PowerPoint.Interfaces.CustomXmlPartData[];
    }
    /** An interface describing the data returned by calling `customXmlPartCollection.toJSON()`. */
    export interface CustomXmlPartCollectionData {
      items?: PowerPoint.Interfaces.CustomXmlPartData[];
    }
    /** An interface describing the data returned by calling `hyperlinkScopedCollection.toJSON()`. */
    export interface HyperlinkScopedCollectionData {
      items?: PowerPoint.Interfaces.HyperlinkData[];
    }
    /** An interface describing the data returned by calling `bulletFormat.toJSON()`. */
    export interface BulletFormatData {
      /**
             * Specifies the style of the bullets in the paragraph. See {@link PowerPoint.BulletStyle} for details.
                        Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet formatting properties.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      style?:
        | PowerPoint.BulletStyle
        | "Unsupported"
        | "AlphabetLowercasePeriod"
        | "AlphabetUppercasePeriod"
        | "ArabicNumeralParenthesisRight"
        | "ArabicNumeralPeriod"
        | "RomanLowercaseParenthesesBoth"
        | "RomanLowercaseParenthesisRight"
        | "RomanLowercasePeriod"
        | "RomanUppercasePeriod"
        | "AlphabetLowercaseParenthesesBoth"
        | "AlphabetLowercaseParenthesisRight"
        | "AlphabetUppercaseParenthesesBoth"
        | "AlphabetUppercaseParenthesisRight"
        | "ArabicNumeralParenthesesBoth"
        | "ArabicNumeralPlain"
        | "RomanUppercaseParenthesesBoth"
        | "RomanUppercaseParenthesisRight"
        | "SimplifiedChinesePlain"
        | "SimplifiedChinesePeriod"
        | "CircleNumberDoubleBytePlain"
        | "CircleNumberWideDoubleByteWhitePlain"
        | "CircleNumberWideDoubleByteBlackPlain"
        | "TraditionalChinesePlain"
        | "TraditionalChinesePeriod"
        | "ArabicAlphabetDash"
        | "ArabicAbjadDash"
        | "HebrewAlphabetDash"
        | "KanjiKoreanPlain"
        | "KanjiKoreanPeriod"
        | "ArabicDoubleBytePlain"
        | "ArabicDoubleBytePeriod"
        | "ThaiAlphabetPeriod"
        | "ThaiAlphabetParenthesisRight"
        | "ThaiAlphabetParenthesesBoth"
        | "ThaiNumeralPeriod"
        | "ThaiNumeralParenthesisRight"
        | "ThaiNumeralParenthesesBoth"
        | "HindiAlphabetPeriod"
        | "HindiNumeralPeriod"
        | "KanjiSimplifiedChineseDoubleBytePeriod"
        | "HindiNumeralParenthesisRight"
        | "HindiAlphabet1Period"
        | null;
      /**
             * Specifies the type of the bullets in the paragraph. See {@link PowerPoint.BulletType} for details.
                        Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet formatting properties.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      type?:
        | PowerPoint.BulletType
        | "Unsupported"
        | "None"
        | "Numbered"
        | "Unnumbered"
        | null;
      /**
       * Specifies if the bullets in the paragraph are visible. Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet visibility values.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      visible?: boolean | null;
    }
    /** An interface describing the data returned by calling `paragraphFormat.toJSON()`. */
    export interface ParagraphFormatData {
      /**
       * Represents the horizontal alignment of the paragraph. Returns 'null' if the 'TextRange' includes text fragments with different horizontal alignment values. See {@link PowerPoint.ParagraphHorizontalAlignment} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      horizontalAlignment?:
        | PowerPoint.ParagraphHorizontalAlignment
        | "Left"
        | "Center"
        | "Right"
        | "Justify"
        | "JustifyLow"
        | "Distributed"
        | "ThaiDistributed"
        | null;
      /**
       * Represents the indent level of the paragraph.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      indentLevel?: number;
    }
    /** An interface describing the data returned by calling `shapeFont.toJSON()`. */
    export interface ShapeFontData {
      /**
             * Specifies whether the text in the `TextRange` is set to use the **All Caps** attribute which makes lowercase letters appear as uppercase letters. The possible values are as follows:
                        
                        - `true`: All the text has the **All Caps** attribute.
                        
                        - `false`: None of the text has the **All Caps** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **All Caps** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      allCaps?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to bold. The possible values are as follows:
                        
                        - `true`: All the text is bold.
                        
                        - `false`: None of the text is bold.
                        
                        - `null`: Returned if some, but not all, of the text is bold.
             *
             * @remarks
             * [Api set: PowerPointApi 1.4]
             */
      bold?: boolean | null;
      /**
       * Specifies the HTML color code representation of the text color (e.g., "#FF0000" represents red). Returns `null` if the `TextRange` contains text fragments with different colors.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      color?: string | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Double strikethrough** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Double strikethrough** attribute.
                        
                        - `false`: None of the text has the **Double strikethrough** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Double strikethrough** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      doubleStrikethrough?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to italic. The possible values are as follows:
                        
                        - `true`: All the text is italicized.
                        
                        - `false`: None of the text is italicized.
                        
                        - `null`: Returned if some, but not all, of the text is italicized.
             *
             * @remarks
             * [Api set: PowerPointApi 1.4]
             */
      italic?: boolean | null;
      /**
       * Specifies the font name (e.g., "Calibri"). If the text is a Complex Script or East Asian language, this is the corresponding font name; otherwise it's the Latin font name. Returns `null` if the `TextRange` contains text fragments with different font names.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      name?: string | null;
      /**
       * Specifies the font size in points (e.g., 11). Returns `null` if the `TextRange` contains text fragments with different font sizes.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      size?: number | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Small Caps** attribute which makes lowercase letters appear as small uppercase letters. The possible values are as follows:
                        
                        - `true`: All the text has the **Small Caps** attribute.
                        
                        - `false`: None of the text has the **Small Caps** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Small Caps** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      smallCaps?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Strikethrough** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Strikethrough** attribute.
                        
                        - `false`: None of the text has the **Strikethrough** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Strikethrough** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      strikethrough?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Subscript** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Subscript** attribute.
                        
                        - `false`: None of the text has the **Subscript** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Subscript** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      subscript?: boolean | null;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Superscript** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Superscript** attribute.
                        
                        - `false`: None of the text has the **Superscript** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Superscript** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      superscript?: boolean | null;
      /**
       * Specifies the type of underline applied to the font. Returns `null` if the `TextRange` contains text fragments with different underline styles. See {@link PowerPoint.ShapeFontUnderlineStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      underline?:
        | PowerPoint.ShapeFontUnderlineStyle
        | "None"
        | "Single"
        | "Double"
        | "Heavy"
        | "Dotted"
        | "DottedHeavy"
        | "Dash"
        | "DashHeavy"
        | "DashLong"
        | "DashLongHeavy"
        | "DotDash"
        | "DotDashHeavy"
        | "DotDotDash"
        | "DotDotDashHeavy"
        | "Wavy"
        | "WavyHeavy"
        | "WavyDouble"
        | null;
    }
    /** An interface describing the data returned by calling `textFrame.toJSON()`. */
    export interface TextFrameData {
      /**
       * The automatic sizing settings for the text frame. A text frame can be set to automatically fit the text to the text frame, to automatically fit the text frame to the text, or not perform any automatic sizing.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      autoSizeSetting?:
        | PowerPoint.ShapeAutoSize
        | "AutoSizeNone"
        | "AutoSizeTextToFitShape"
        | "AutoSizeShapeToFitText"
        | "AutoSizeMixed";
      /**
       * Represents the bottom margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      bottomMargin?: number;
      /**
       * Specifies if the text frame contains text.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      hasText?: boolean;
      /**
       * Represents the left margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      leftMargin?: number;
      /**
       * Represents the right margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      rightMargin?: number;
      /**
       * Represents the top margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      topMargin?: number;
      /**
       * Represents the vertical alignment of the text frame. See {@link PowerPoint.TextVerticalAlignment} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      verticalAlignment?:
        | PowerPoint.TextVerticalAlignment
        | "Top"
        | "Middle"
        | "Bottom"
        | "TopCentered"
        | "MiddleCentered"
        | "BottomCentered";
      /**
       * Determines whether lines break automatically to fit text inside the shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      wordWrap?: boolean;
    }
    /** An interface describing the data returned by calling `textRange.toJSON()`. */
    export interface TextRangeData {
      /**
             * Gets or sets the length of the range that this `TextRange` represents.
                        Throws an `InvalidArgument` exception when set with a negative value or if the value is greater than the length of the available text from the starting point.
             *
             * @remarks
             * [Api set: PowerPointApi 1.5]
             */
      length?: number;
      /**
             * Gets or sets zero-based index, relative to the parent text frame, for the starting position of the range that this `TextRange` represents.
                        Throws an `InvalidArgument` exception when set with a negative value or if the value is greater than the length of the text.
             *
             * @remarks
             * [Api set: PowerPointApi 1.5]
             */
      start?: number;
      /**
       * Represents the plain text content of the text range.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      text?: string;
    }
    /** An interface describing the data returned by calling `hyperlink.toJSON()`. */
    export interface HyperlinkData {
      /**
       * Specifies the address of the hyperlink, which can be a URL, a file name or file path, or an email address with the `mailto` URI scheme.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      address?: string;
      /**
       * Specifies the string displayed when hovering over the hyperlink.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      screenTip?: string;
      /**
       * Returns the type of object that the hyperlink is applied to. See {@link PowerPoint.HyperlinkType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?: PowerPoint.HyperlinkType | "TextRange" | "Shape";
    }
    /** An interface describing the data returned by calling `placeholderFormat.toJSON()`. */
    export interface PlaceholderFormatData {
      /**
             * Gets the type of the shape contained within the placeholder. See {@link PowerPoint.ShapeType} for details.
                        Returns `null` if the placeholder is empty.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      containedType?:
        | PowerPoint.ShapeType
        | "Unsupported"
        | "Image"
        | "GeometricShape"
        | "Group"
        | "Line"
        | "Table"
        | "Callout"
        | "Chart"
        | "ContentApp"
        | "Diagram"
        | "Freeform"
        | "Graphic"
        | "Ink"
        | "Media"
        | "Model3D"
        | "Ole"
        | "Placeholder"
        | "SmartArt"
        | "TextBox"
        | null;
      /**
       * Returns the type of this placeholder. See {@link PowerPoint.PlaceholderType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      type?:
        | PowerPoint.PlaceholderType
        | "Unsupported"
        | "Date"
        | "SlideNumber"
        | "Footer"
        | "Header"
        | "Title"
        | "Body"
        | "CenterTitle"
        | "Subtitle"
        | "VerticalTitle"
        | "VerticalBody"
        | "Content"
        | "Chart"
        | "Table"
        | "OnlinePicture"
        | "SmartArt"
        | "Media"
        | "VerticalContent"
        | "Picture"
        | "Cameo";
    }
    /** An interface describing the data returned by calling `hyperlinkCollection.toJSON()`. */
    export interface HyperlinkCollectionData {
      items?: PowerPoint.Interfaces.HyperlinkData[];
    }
    /** An interface describing the data returned by calling `shapeScopedCollection.toJSON()`. */
    export interface ShapeScopedCollectionData {
      items?: PowerPoint.Interfaces.ShapeData[];
    }
    /** An interface describing the data returned by calling `border.toJSON()`. */
    export interface BorderData {
      /**
       * Represents the line color in the hexadecimal format #RRGGBB (e.g., "FFA500") or as a named HTML color value (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      color?: string | undefined;
      /**
       * Represents the dash style of the line.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      dashStyle?:
        | PowerPoint.ShapeLineDashStyle
        | "Dash"
        | "DashDot"
        | "DashDotDot"
        | "LongDash"
        | "LongDashDot"
        | "RoundDot"
        | "Solid"
        | "SquareDot"
        | "LongDashDotDot"
        | "SystemDash"
        | "SystemDot"
        | "SystemDashDot"
        | undefined;
      /**
       * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      transparency?: number | undefined;
      /**
       * Represents the weight of the line, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      weight?: number | undefined;
    }
    /** An interface describing the data returned by calling `borders.toJSON()`. */
    export interface BordersData {}
    /** An interface describing the data returned by calling `margins.toJSON()`. */
    export interface MarginsData {
      /**
       * Specifies the bottom margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      bottom?: number | undefined;
      /**
       * Specifies the left margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      left?: number | undefined;
      /**
       * Specifies the right margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      right?: number | undefined;
      /**
       * Specifies the top margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      top?: number | undefined;
    }
    /** An interface describing the data returned by calling `shapeFill.toJSON()`. */
    export interface ShapeFillData {
      /**
       * Represents the shape fill foreground color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      foregroundColor?: string;
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear). Returns `null` if the shape type doesn't support transparency or the shape fill has inconsistent transparency, such as with a gradient fill type.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      transparency?: number;
      /**
       * Returns the fill type of the shape. See {@link PowerPoint.ShapeFillType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      type?:
        | PowerPoint.ShapeFillType
        | "NoFill"
        | "Solid"
        | "Gradient"
        | "Pattern"
        | "PictureAndTexture"
        | "SlideBackground";
    }
    /** An interface describing the data returned by calling `tableCell.toJSON()`. */
    export interface TableCellData {
      /**
             * Gets the number of table columns this cell spans across.
                        Will be greater than or equal to 1.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      columnCount?: number;
      /**
       * Gets the zero-based column index of the cell within the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      columnIndex?: number;
      /**
       * Specifies the horizontal alignment of the text in the table cell. Returns `null` if the cell text contains different alignments.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      horizontalAlignment?:
        | PowerPoint.ParagraphHorizontalAlignment
        | "Left"
        | "Center"
        | "Right"
        | "Justify"
        | "JustifyLow"
        | "Distributed"
        | "ThaiDistributed"
        | null;
      /**
       * Specifies the indent level of the text in the table cell. Returns `null` if the cell text contains different indent levels.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      indentLevel?: number | null;
      /**
             * Gets the number of table rows this cell spans across.
                        Will be greater than or equal to 1.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      rowCount?: number;
      /**
       * Gets the zero-based row index of the cell within the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      rowIndex?: number;
      /**
       * Specifies the text content of the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      text?: string;
      /**
             * Specifies the contents of the table cell as an array of {@link PowerPoint.TextRun} objects.
                        Each `TextRun` object represents a sequence of one or more characters that share the same font attributes.
             *
             * @remarks
             * [Api set: PowerPointApi 1.9]
             */
      textRuns?: PowerPoint.TextRun[];
      /**
       * Specifies the vertical alignment of the text in the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      verticalAlignment?:
        | PowerPoint.TextVerticalAlignment
        | "Top"
        | "Middle"
        | "Bottom"
        | "TopCentered"
        | "MiddleCentered"
        | "BottomCentered";
    }
    /** An interface describing the data returned by calling `tableCellCollection.toJSON()`. */
    export interface TableCellCollectionData {
      items?: PowerPoint.Interfaces.TableCellData[];
    }
    /** An interface describing the data returned by calling `tableColumn.toJSON()`. */
    export interface TableColumnData {
      /**
       * Returns the index number of the column within the column collection of the table. Zero-indexed.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      columnIndex?: number;
      /**
       * Retrieves the width of the column in points. If the set column width is less than the minimum width, the column width will be increased to the minimum width.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      width?: number;
    }
    /** An interface describing the data returned by calling `tableColumnCollection.toJSON()`. */
    export interface TableColumnCollectionData {
      items?: PowerPoint.Interfaces.TableColumnData[];
    }
    /** An interface describing the data returned by calling `tableRow.toJSON()`. */
    export interface TableRowData {
      /**
       * Retrieves the current height of the row in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      currentHeight?: number;
      /**
       * Specifies the height of the row in points. If the set row height is less than the minimum height, the row height will be increased to the minimum height.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      height?: number;
      /**
       * Returns the index number of the row within the rows collection of the table. Zero-indexed.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      rowIndex?: number;
    }
    /** An interface describing the data returned by calling `tableRowCollection.toJSON()`. */
    export interface TableRowCollectionData {
      items?: PowerPoint.Interfaces.TableRowData[];
    }
    /** An interface describing the data returned by calling `tableStyleSettings.toJSON()`. */
    export interface TableStyleSettingsData {
      /**
       * Specifies if the columns show banded formatting in which odd columns are highlighted differently from even ones, to make reading the table easier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      areColumnsBanded?: boolean;
      /**
       * Specifies if the rows show banded formatting in which odd rows are highlighted differently from even ones, to make reading the table easier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      areRowsBanded?: boolean;
      /**
       * Specifies if the first column contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isFirstColumnHighlighted?: boolean;
      /**
       * Specifies if the first row contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isFirstRowHighlighted?: boolean;
      /**
       * Specifies if the last column contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isLastColumnHighlighted?: boolean;
      /**
       * Specifies if the last row contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isLastRowHighlighted?: boolean;
      /**
       * Specifies the table style.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      style?:
        | PowerPoint.TableStyle
        | "NoStyleNoGrid"
        | "ThemedStyle1Accent1"
        | "ThemedStyle1Accent2"
        | "ThemedStyle1Accent3"
        | "ThemedStyle1Accent4"
        | "ThemedStyle1Accent5"
        | "ThemedStyle1Accent6"
        | "NoStyleTableGrid"
        | "ThemedStyle2Accent1"
        | "ThemedStyle2Accent2"
        | "ThemedStyle2Accent3"
        | "ThemedStyle2Accent4"
        | "ThemedStyle2Accent5"
        | "ThemedStyle2Accent6"
        | "LightStyle1"
        | "LightStyle1Accent1"
        | "LightStyle1Accent2"
        | "LightStyle1Accent3"
        | "LightStyle1Accent4"
        | "LightStyle1Accent5"
        | "LightStyle1Accent6"
        | "LightStyle2"
        | "LightStyle2Accent1"
        | "LightStyle2Accent2"
        | "LightStyle2Accent3"
        | "LightStyle2Accent4"
        | "LightStyle2Accent5"
        | "LightStyle2Accent6"
        | "LightStyle3"
        | "LightStyle3Accent1"
        | "LightStyle3Accent2"
        | "LightStyle3Accent3"
        | "LightStyle3Accent4"
        | "LightStyle3Accent5"
        | "LightStyle3Accent6"
        | "MediumStyle1"
        | "MediumStyle1Accent1"
        | "MediumStyle1Accent2"
        | "MediumStyle1Accent3"
        | "MediumStyle1Accent4"
        | "MediumStyle1Accent5"
        | "MediumStyle1Accent6"
        | "MediumStyle2"
        | "MediumStyle2Accent1"
        | "MediumStyle2Accent2"
        | "MediumStyle2Accent3"
        | "MediumStyle2Accent4"
        | "MediumStyle2Accent5"
        | "MediumStyle2Accent6"
        | "MediumStyle3"
        | "MediumStyle3Accent1"
        | "MediumStyle3Accent2"
        | "MediumStyle3Accent3"
        | "MediumStyle3Accent4"
        | "MediumStyle3Accent5"
        | "MediumStyle3Accent6"
        | "MediumStyle4"
        | "MediumStyle4Accent1"
        | "MediumStyle4Accent2"
        | "MediumStyle4Accent3"
        | "MediumStyle4Accent4"
        | "MediumStyle4Accent5"
        | "MediumStyle4Accent6"
        | "DarkStyle1"
        | "DarkStyle1Accent1"
        | "DarkStyle1Accent2"
        | "DarkStyle1Accent3"
        | "DarkStyle1Accent4"
        | "DarkStyle1Accent5"
        | "DarkStyle1Accent6"
        | "DarkStyle2"
        | "DarkStyle2Accent1"
        | "DarkStyle2Accent2"
        | "DarkStyle2Accent3";
    }
    /** An interface describing the data returned by calling `table.toJSON()`. */
    export interface TableData {
      /**
       * Gets the number of columns in the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      columnCount?: number;
      /**
       * Gets the number of rows in the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      rowCount?: number;
      /**
       * Gets all of the values in the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      values?: string[][];
    }
    /** An interface describing the data returned by calling `shapeCollection.toJSON()`. */
    export interface ShapeCollectionData {
      items?: PowerPoint.Interfaces.ShapeData[];
    }
    /** An interface describing the data returned by calling `slideBackgroundGradientFill.toJSON()`. */
    export interface SlideBackgroundGradientFillData {
      /**
       * Specifies the type of gradient fill.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?:
        | PowerPoint.SlideBackgroundGradientFillType
        | "Unsupported"
        | "Linear"
        | "Radial"
        | "Rectangular"
        | "Path"
        | "ShadeFromTitle";
    }
    /** An interface describing the data returned by calling `slideBackgroundPatternFill.toJSON()`. */
    export interface SlideBackgroundPatternFillData {
      /**
       * Specifies the background color in HTML color format (e.g., "#FFFFFF" or "white").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      backgroundColor?: string;
      /**
       * Specifies the foreground color in HTML color format (e.g., "#FFA500" or "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      foregroundColor?: string;
      /**
       * Specifies the pattern type.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      pattern?:
        | PowerPoint.SlideBackgroundPatternFillType
        | "Unsupported"
        | "Percent5"
        | "Percent10"
        | "Percent20"
        | "Percent25"
        | "Percent30"
        | "Percent40"
        | "Percent50"
        | "Percent60"
        | "Percent70"
        | "Percent75"
        | "Percent80"
        | "Percent90"
        | "Horizontal"
        | "Vertical"
        | "LightHorizontal"
        | "LightVertical"
        | "DarkHorizontal"
        | "DarkVertical"
        | "NarrowHorizontal"
        | "NarrowVertical"
        | "DashedHorizontal"
        | "DashedVertical"
        | "Cross"
        | "DownwardDiagonal"
        | "UpwardDiagonal"
        | "LightDownwardDiagonal"
        | "LightUpwardDiagonal"
        | "DarkDownwardDiagonal"
        | "DarkUpwardDiagonal"
        | "WideDownwardDiagonal"
        | "WideUpwardDiagonal"
        | "DashedDownwardDiagonal"
        | "DashedUpwardDiagonal"
        | "DiagonalCross"
        | "SmallCheckerBoard"
        | "LargeCheckerBoard"
        | "SmallGrid"
        | "LargeGrid"
        | "DottedGrid"
        | "SmallConfetti"
        | "LargeConfetti"
        | "HorizontalBrick"
        | "DiagonalBrick"
        | "SolidDiamond"
        | "OutlinedDiamond"
        | "DottedDiamond"
        | "Plaid"
        | "Sphere"
        | "Weave"
        | "Divot"
        | "Shingle"
        | "Wave"
        | "Trellis"
        | "ZigZag";
    }
    /** An interface describing the data returned by calling `slideBackgroundPictureOrTextureFill.toJSON()`. */
    export interface SlideBackgroundPictureOrTextureFillData {
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      transparency?: number;
    }
    /** An interface describing the data returned by calling `slideBackgroundSolidFill.toJSON()`. */
    export interface SlideBackgroundSolidFillData {
      /**
       * Specifies the fill color in HTML color format (e.g., "#FFA500" or "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      color?: string;
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      transparency?: number;
    }
    /** An interface describing the data returned by calling `slideBackgroundFill.toJSON()`. */
    export interface SlideBackgroundFillData {
      /**
       * Returns the fill type of the slide background. See {@link PowerPoint.SlideBackgroundFillType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?:
        | PowerPoint.SlideBackgroundFillType
        | "Unsupported"
        | "Solid"
        | "Gradient"
        | "PictureOrTexture"
        | "Pattern";
    }
    /** An interface describing the data returned by calling `slideBackground.toJSON()`. */
    export interface SlideBackgroundData {
      /**
       * Specifies whether the slide layout background fill hides or displays background graphic objects from the slide master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      areBackgroundGraphicsHidden?: boolean;
      /**
       * Specifies if the slide background follows the slide master background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      isMasterBackgroundFollowed?: boolean;
    }
    /** An interface describing the data returned by calling `slideLayoutBackground.toJSON()`. */
    export interface SlideLayoutBackgroundData {
      /**
       * Specifies whether the slide layout background fill hides or displays background graphic objects from the slide master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      areBackgroundGraphicsHidden?: boolean;
      /**
       * Specifies if the slide layout background follows the slide master background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      isMasterBackgroundFollowed?: boolean;
    }
    /** An interface describing the data returned by calling `slideLayout.toJSON()`. */
    export interface SlideLayoutData {
      /**
       * Gets the unique ID of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: string;
      /**
       * Gets the name of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      name?: string;
      /**
       * Returns the type of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      type?:
        | PowerPoint.SlideLayoutType
        | "Blank"
        | "Chart"
        | "ChartAndText"
        | "ClipArtAndText"
        | "ClipArtAndVerticalText"
        | "Comparison"
        | "ContentWithCaption"
        | "Custom"
        | "FourObjects"
        | "LargeObject"
        | "MediaClipAndText"
        | "Mixed"
        | "Object"
        | "ObjectAndText"
        | "ObjectAndTwoObjects"
        | "ObjectOverText"
        | "OrganizationChart"
        | "PictureWithCaption"
        | "SectionHeader"
        | "Table"
        | "Text"
        | "TextAndChart"
        | "TextAndClipArt"
        | "TextAndMediaClip"
        | "TextAndObject"
        | "TextAndTwoObjects"
        | "TextOverObject"
        | "Title"
        | "TitleOnly"
        | "TwoColumnText"
        | "TwoObjects"
        | "TwoObjectsAndObject"
        | "TwoObjectsAndText"
        | "TwoObjectsOverText"
        | "VerticalText"
        | "VerticalTitleAndText"
        | "VerticalTitleAndTextOverChart";
    }
    /** An interface describing the data returned by calling `slideLayoutCollection.toJSON()`. */
    export interface SlideLayoutCollectionData {
      items?: PowerPoint.Interfaces.SlideLayoutData[];
    }
    /** An interface describing the data returned by calling `slideMasterBackground.toJSON()`. */
    export interface SlideMasterBackgroundData {}
    /** An interface describing the data returned by calling `slideMaster.toJSON()`. */
    export interface SlideMasterData {
      /**
       * Gets the unique ID of the Slide Master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: string;
      /**
       * Gets the unique name of the Slide Master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      name?: string;
    }
    /** An interface describing the data returned by calling `tag.toJSON()`. */
    export interface TagData {
      /**
       * Gets the unique ID of the tag. The `key` is unique within the owning `TagCollection` and always stored as uppercase letters within the document.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      key?: string;
      /**
       * Gets the value of the tag.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      value?: string;
    }
    /** An interface describing the data returned by calling `tagCollection.toJSON()`. */
    export interface TagCollectionData {
      items?: PowerPoint.Interfaces.TagData[];
    }
    /** An interface describing the data returned by calling `slide.toJSON()`. */
    export interface SlideData {
      /**
       * Gets the unique ID of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.2]
       */
      id?: string;
      /**
       * Returns the zero-based index of the slide representing its position in the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      index?: number;
    }
    /** An interface describing the data returned by calling `shapeGroup.toJSON()`. */
    export interface ShapeGroupData {
      /**
       * Gets the creation ID of the shape group. Returns `null` if the shape group has no creation ID.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      creationId?: string | null;
      /**
       * Gets the unique ID of the shape group.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      id?: string;
    }
    /** An interface describing the data returned by calling `shapeLineFormat.toJSON()`. */
    export interface ShapeLineFormatData {
      /**
       * Represents the line color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      color?: string;
      /**
       * Represents the dash style of the line. Returns null when the line isn't visible or there are inconsistent dash styles. See {@link PowerPoint.ShapeLineDashStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      dashStyle?:
        | PowerPoint.ShapeLineDashStyle
        | "Dash"
        | "DashDot"
        | "DashDotDot"
        | "LongDash"
        | "LongDashDot"
        | "RoundDot"
        | "Solid"
        | "SquareDot"
        | "LongDashDotDot"
        | "SystemDash"
        | "SystemDot"
        | "SystemDashDot";
      /**
       * Represents the line style of the shape. Returns null when the line isn't visible or there are inconsistent styles. See {@link PowerPoint.ShapeLineStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      style?:
        | PowerPoint.ShapeLineStyle
        | "Single"
        | "ThickBetweenThin"
        | "ThickThin"
        | "ThinThick"
        | "ThinThin";
      /**
       * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear). Returns null when the shape has inconsistent transparencies.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      transparency?: number;
      /**
       * Specifies if the line formatting of a shape element is visible. Returns `null` when the shape has inconsistent visibilities.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      visible?: boolean;
      /**
       * Represents the weight of the line, in points. Returns `null` when the line isn't visible or there are inconsistent line weights.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      weight?: number;
    }
    /** An interface describing the data returned by calling `shape.toJSON()`. */
    export interface ShapeData {
      /**
             * The alt text description of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextDescription?: string;
      /**
             * The alt text title of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
                        A title can be read to a person with a disability and is used to determine whether they wish to hear the description of the content.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextTitle?: string;
      /**
       * Gets the creation ID of the shape. Returns `null` if the shape has no creation ID.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      creationId?: string | null;
      /**
       * Specifies the height, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      height?: number;
      /**
       * Gets the unique ID of the shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: string;
      /**
             * Represents whether the shape is decorative or not.
                        
                        Decorative objects add visual interest but aren't informative (e.g. stylistic borders).
                        People using screen readers will hear these are decorative so they know they aren't missing any important information.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      isDecorative?: boolean;
      /**
       * The distance, in points, from the left side of the shape to the left side of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      left?: number;
      /**
             * Returns the level of the specified shape.
                        
                        - A level of 0 means the shape isn't part of a group.
                        
                        - A level of 1 means the shape is part of a top-level group.
                        
                        - A level greater than 1 indicates the shape is a nested group.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      level?: number;
      /**
       * Specifies the name of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      name?: string;
      /**
             * Specifies the rotation, in degrees, of the shape around the z-axis.
                        A positive value indicates clockwise rotation, and a negative value indicates counterclockwise rotation.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      rotation?: number;
      /**
       * The distance, in points, from the top edge of the shape to the top edge of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      top?: number;
      /**
       * Returns the type of this shape. See {@link PowerPoint.ShapeType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      type?:
        | PowerPoint.ShapeType
        | "Unsupported"
        | "Image"
        | "GeometricShape"
        | "Group"
        | "Line"
        | "Table"
        | "Callout"
        | "Chart"
        | "ContentApp"
        | "Diagram"
        | "Freeform"
        | "Graphic"
        | "Ink"
        | "Media"
        | "Model3D"
        | "Ole"
        | "Placeholder"
        | "SmartArt"
        | "TextBox";
      /**
       * Specifies if the shape is visible.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      visible?: boolean;
      /**
       * Specifies the width, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      width?: number;
      /**
             * Returns the z-order position of the shape, with 0 representing the bottom of the order stack. Every shape on a slide has a unique z-order, but
                        each slide also has a unique z-order stack, so two shapes on separate slides could have the same z-order number.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      zOrderPosition?: number;
    }
    /** An interface describing the data returned by calling `binding.toJSON()`. */
    export interface BindingData {
      /**
       * Represents the binding identifier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      id?: string;
      /**
       * Returns the type of the binding. See `BindingType` for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      type?: PowerPoint.BindingType | "Shape";
    }
    /** An interface describing the data returned by calling `bindingCollection.toJSON()`. */
    export interface BindingCollectionData {
      items?: PowerPoint.Interfaces.BindingData[];
    }
    /** An interface describing the data returned by calling `customProperty.toJSON()`. */
    export interface CustomPropertyData {
      /**
       * The string that uniquely identifies the custom property.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      key?: string;
      /**
       * The type of the value used for the custom property.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      type?:
        | PowerPoint.DocumentPropertyType
        | "Boolean"
        | "Date"
        | "Number"
        | "String";
      /**
             * The value of the custom property.
                        If the value is a string, the maximum length 255 characters. Larger strings cause the operation to fail with an `InvalidArgument` error.
             *
             * @remarks
             * [Api set: PowerPointApi 1.7]
             */
      value?: boolean | Date | number | string;
    }
    /** An interface describing the data returned by calling `customPropertyCollection.toJSON()`. */
    export interface CustomPropertyCollectionData {
      items?: PowerPoint.Interfaces.CustomPropertyData[];
    }
    /** An interface describing the data returned by calling `documentProperties.toJSON()`. */
    export interface DocumentPropertiesData {
      /**
       * The author of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      author?: string;
      /**
       * The category of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      category?: string;
      /**
       * The Comments field in the metadata of the presentation. These have no connection to comments made in slides.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      comments?: string;
      /**
       * The company of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      company?: string;
      /**
       * The creation date of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      creationDate?: Date;
      /**
       * The keywords of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      keywords?: string;
      /**
       * The last author of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      lastAuthor?: string;
      /**
       * The manager of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      manager?: string;
      /**
       * The revision number of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      revisionNumber?: number;
      /**
       * The subject of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      subject?: string;
      /**
       * The title of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      title?: string;
    }
    /** An interface describing the data returned by calling `pageSetup.toJSON()`. */
    export interface PageSetupData {
      /**
       * Specifies the height of the slides in the presentation, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      slideHeight?: number;
      /**
       * Specifies the width of the slides in the presentation, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      slideWidth?: number;
    }
    /** An interface describing the data returned by calling `slideCollection.toJSON()`. */
    export interface SlideCollectionData {
      items?: PowerPoint.Interfaces.SlideData[];
    }
    /** An interface describing the data returned by calling `slideScopedCollection.toJSON()`. */
    export interface SlideScopedCollectionData {
      items?: PowerPoint.Interfaces.SlideData[];
    }
    /** An interface describing the data returned by calling `slideMasterCollection.toJSON()`. */
    export interface SlideMasterCollectionData {
      items?: PowerPoint.Interfaces.SlideMasterData[];
    }
    /**
         * The `Presentation` object is the top-level object with one or more slides that contain the contents of the presentation.
                    To learn more about the PowerPoint object model,
                    see {@link https://learn.microsoft.com/office/dev/add-ins/powerpoint/core-concepts | PowerPoint JavaScript object model}.
         *
         * @remarks
         * [Api set: PowerPointApi 1.0]
         */
    export interface PresentationLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns the page setup information whose properties control slide setup attributes for the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      pageSetup?: PowerPoint.Interfaces.PageSetupLoadOptions;
      /**
       * Gets the properties of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      properties?: PowerPoint.Interfaces.DocumentPropertiesLoadOptions;
      /**
       * Gets the ID of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.5]
       */
      id?: boolean;
      /**
       * Returns the title of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.0]
       */
      title?: boolean;
    }
    /**
     * Represents the adjustment values for a shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface AdjustmentsLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies the number of adjustment points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      count?: boolean;
    }
    /**
     * Represents a custom XML part object.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    export interface CustomXmlPartLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * The ID of the custom XML part.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      id?: boolean;
      /**
       * The namespace URI of the custom XML part.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      namespaceUri?: boolean;
    }
    /**
         * A scoped collection of custom XML parts.
                    A scoped collection is the result of some operation (such as filtering by namespace).
                    A scoped collection cannot be scoped any further.
         *
         * @remarks
         * [Api set: PowerPointApi 1.7]
         */
    export interface CustomXmlPartScopedCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: The ID of the custom XML part.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      id?: boolean;
      /**
       * For EACH ITEM in the collection: The namespace URI of the custom XML part.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      namespaceUri?: boolean;
    }
    /**
     * A collection of custom XML parts.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    export interface CustomXmlPartCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: The ID of the custom XML part.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      id?: boolean;
      /**
       * For EACH ITEM in the collection: The namespace URI of the custom XML part.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      namespaceUri?: boolean;
    }
    /**
     * Represents a scoped collection of hyperlinks.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface HyperlinkScopedCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the address of the hyperlink, which can be a URL, a file name or file path, or an email address with the `mailto` URI scheme.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      address?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the string displayed when hovering over the hyperlink.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      screenTip?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the type of object that the hyperlink is applied to. See {@link PowerPoint.HyperlinkType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?: boolean;
    }
    /**
     * Represents the bullet formatting properties of a text that is attached to the {@link PowerPoint.ParagraphFormat}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    export interface BulletFormatLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
             * Specifies the style of the bullets in the paragraph. See {@link PowerPoint.BulletStyle} for details.
                        Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet formatting properties.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      style?: boolean;
      /**
             * Specifies the type of the bullets in the paragraph. See {@link PowerPoint.BulletType} for details.
                        Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet formatting properties.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      type?: boolean;
      /**
       * Specifies if the bullets in the paragraph are visible. Returns `null` if the {@link PowerPoint.TextRange} includes text fragments with different bullet visibility values.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      visible?: boolean;
    }
    /**
     * Represents the paragraph formatting properties of a text that is attached to the {@link PowerPoint.TextRange}.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    export interface ParagraphFormatLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Represents the bullet format of the paragraph. See {@link PowerPoint.BulletFormat} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      bulletFormat?: PowerPoint.Interfaces.BulletFormatLoadOptions;
      /**
       * Represents the horizontal alignment of the paragraph. Returns 'null' if the 'TextRange' includes text fragments with different horizontal alignment values. See {@link PowerPoint.ParagraphHorizontalAlignment} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      horizontalAlignment?: boolean;
      /**
       * Represents the indent level of the paragraph.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      indentLevel?: boolean;
    }
    /**
     * Represents the font attributes, such as font name, font size, and color, for a shape's TextRange object.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    export interface ShapeFontLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **All Caps** attribute which makes lowercase letters appear as uppercase letters. The possible values are as follows:
                        
                        - `true`: All the text has the **All Caps** attribute.
                        
                        - `false`: None of the text has the **All Caps** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **All Caps** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      allCaps?: boolean;
      /**
             * Specifies whether the text in the `TextRange` is set to bold. The possible values are as follows:
                        
                        - `true`: All the text is bold.
                        
                        - `false`: None of the text is bold.
                        
                        - `null`: Returned if some, but not all, of the text is bold.
             *
             * @remarks
             * [Api set: PowerPointApi 1.4]
             */
      bold?: boolean;
      /**
       * Specifies the HTML color code representation of the text color (e.g., "#FF0000" represents red). Returns `null` if the `TextRange` contains text fragments with different colors.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      color?: boolean;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Double strikethrough** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Double strikethrough** attribute.
                        
                        - `false`: None of the text has the **Double strikethrough** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Double strikethrough** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      doubleStrikethrough?: boolean;
      /**
             * Specifies whether the text in the `TextRange` is set to italic. The possible values are as follows:
                        
                        - `true`: All the text is italicized.
                        
                        - `false`: None of the text is italicized.
                        
                        - `null`: Returned if some, but not all, of the text is italicized.
             *
             * @remarks
             * [Api set: PowerPointApi 1.4]
             */
      italic?: boolean;
      /**
       * Specifies the font name (e.g., "Calibri"). If the text is a Complex Script or East Asian language, this is the corresponding font name; otherwise it's the Latin font name. Returns `null` if the `TextRange` contains text fragments with different font names.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      name?: boolean;
      /**
       * Specifies the font size in points (e.g., 11). Returns `null` if the `TextRange` contains text fragments with different font sizes.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      size?: boolean;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Small Caps** attribute which makes lowercase letters appear as small uppercase letters. The possible values are as follows:
                        
                        - `true`: All the text has the **Small Caps** attribute.
                        
                        - `false`: None of the text has the **Small Caps** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Small Caps** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      smallCaps?: boolean;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Strikethrough** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Strikethrough** attribute.
                        
                        - `false`: None of the text has the **Strikethrough** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Strikethrough** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      strikethrough?: boolean;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Subscript** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Subscript** attribute.
                        
                        - `false`: None of the text has the **Subscript** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Subscript** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      subscript?: boolean;
      /**
             * Specifies whether the text in the `TextRange` is set to use the **Superscript** attribute. The possible values are as follows:
                        
                        - `true`: All the text has the **Superscript** attribute.
                        
                        - `false`: None of the text has the **Superscript** attribute.
                        
                        - `null`: Returned if some, but not all, of the text has the **Superscript** attribute.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      superscript?: boolean;
      /**
       * Specifies the type of underline applied to the font. Returns `null` if the `TextRange` contains text fragments with different underline styles. See {@link PowerPoint.ShapeFontUnderlineStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      underline?: boolean;
    }
    /**
     * Represents the text frame of a shape object.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    export interface TextFrameLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Represents the text that is attached to a shape in the text frame, and properties and methods for manipulating the text. See {@link PowerPoint.TextRange} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      textRange?: PowerPoint.Interfaces.TextRangeLoadOptions;
      /**
       * The automatic sizing settings for the text frame. A text frame can be set to automatically fit the text to the text frame, to automatically fit the text frame to the text, or not perform any automatic sizing.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      autoSizeSetting?: boolean;
      /**
       * Represents the bottom margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      bottomMargin?: boolean;
      /**
       * Specifies if the text frame contains text.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      hasText?: boolean;
      /**
       * Represents the left margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      leftMargin?: boolean;
      /**
       * Represents the right margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      rightMargin?: boolean;
      /**
       * Represents the top margin, in points, of the text frame.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      topMargin?: boolean;
      /**
       * Represents the vertical alignment of the text frame. See {@link PowerPoint.TextVerticalAlignment} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      verticalAlignment?: boolean;
      /**
       * Determines whether lines break automatically to fit text inside the shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      wordWrap?: boolean;
    }
    /**
     * Contains the text that is attached to a shape, in addition to properties and methods for manipulating the text.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    export interface TextRangeLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns a `ShapeFont` object that represents the font attributes for the text range.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      font?: PowerPoint.Interfaces.ShapeFontLoadOptions;
      /**
       * Represents the paragraph format of the text range. See {@link PowerPoint.ParagraphFormat} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      paragraphFormat?: PowerPoint.Interfaces.ParagraphFormatLoadOptions;
      /**
             * Gets or sets the length of the range that this `TextRange` represents.
                        Throws an `InvalidArgument` exception when set with a negative value or if the value is greater than the length of the available text from the starting point.
             *
             * @remarks
             * [Api set: PowerPointApi 1.5]
             */
      length?: boolean;
      /**
             * Gets or sets zero-based index, relative to the parent text frame, for the starting position of the range that this `TextRange` represents.
                        Throws an `InvalidArgument` exception when set with a negative value or if the value is greater than the length of the text.
             *
             * @remarks
             * [Api set: PowerPointApi 1.5]
             */
      start?: boolean;
      /**
       * Represents the plain text content of the text range.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      text?: boolean;
    }
    /**
     * Represents a single hyperlink.
     *
     * @remarks
     * [Api set: PowerPointApi 1.6]
     */
    export interface HyperlinkLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies the address of the hyperlink, which can be a URL, a file name or file path, or an email address with the `mailto` URI scheme.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      address?: boolean;
      /**
       * Specifies the string displayed when hovering over the hyperlink.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      screenTip?: boolean;
      /**
       * Returns the type of object that the hyperlink is applied to. See {@link PowerPoint.HyperlinkType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?: boolean;
    }
    /**
     * Represents the properties of a `placeholder` shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    export interface PlaceholderFormatLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
             * Gets the type of the shape contained within the placeholder. See {@link PowerPoint.ShapeType} for details.
                        Returns `null` if the placeholder is empty.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      containedType?: boolean;
      /**
       * Returns the type of this placeholder. See {@link PowerPoint.PlaceholderType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      type?: boolean;
    }
    /**
     * Represents a collection of hyperlinks.
     *
     * @remarks
     * [Api set: PowerPointApi 1.6]
     */
    export interface HyperlinkCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the address of the hyperlink, which can be a URL, a file name or file path, or an email address with the `mailto` URI scheme.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      address?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the string displayed when hovering over the hyperlink.
       *
       * @remarks
       * [Api set: PowerPointApi 1.6]
       */
      screenTip?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the type of object that the hyperlink is applied to. See {@link PowerPoint.HyperlinkType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?: boolean;
    }
    /**
     * Represents a collection of shapes.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    export interface ShapeScopedCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Returns an `Adjustments` object that contains adjustment values for all the adjustments in this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      adjustments?: PowerPoint.Interfaces.AdjustmentsLoadOptions;
      /**
       * For EACH ITEM in the collection: Returns the fill formatting of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.5]
       */
      fill?: PowerPoint.Interfaces.ShapeFillLoadOptions;
      /**
            * For EACH ITEM in the collection: Returns the `ShapeGroup` associated with the shape.
            If the shape type isn't `group`, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      group?: PowerPoint.Interfaces.ShapeGroupLoadOptions;
      /**
       * For EACH ITEM in the collection: Returns the line formatting of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.5]
       */
      lineFormat?: PowerPoint.Interfaces.ShapeLineFormatLoadOptions;
      /**
            * For EACH ITEM in the collection: Returns the parent group of this shape.
            If the shape isn't part of a group, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      parentGroup?: PowerPoint.Interfaces.ShapeLoadOptions;
      /**
            * For EACH ITEM in the collection: Returns the properties that apply specifically to this placeholder.
            If the shape type isn't `placeholder`, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      placeholderFormat?: PowerPoint.Interfaces.PlaceholderFormatLoadOptions;
      /**
       * For EACH ITEM in the collection: Returns the {@link PowerPoint.TextFrame} object of this `Shape`. Throws an `InvalidArgument` exception if the shape doesn't support a `TextFrame`.
       *
       * @remarks
       * [Api set: PowerPointApi 1.5]
       */
      textFrame?: PowerPoint.Interfaces.TextFrameLoadOptions;
      /**
             * For EACH ITEM in the collection: The alt text description of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextDescription?: boolean;
      /**
             * For EACH ITEM in the collection: The alt text title of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
                        A title can be read to a person with a disability and is used to determine whether they wish to hear the description of the content.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextTitle?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the creation ID of the shape. Returns `null` if the shape has no creation ID.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      creationId?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the height, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      height?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the unique ID of the shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: boolean;
      /**
             * For EACH ITEM in the collection: Represents whether the shape is decorative or not.
                        
                        Decorative objects add visual interest but aren't informative (e.g. stylistic borders).
                        People using screen readers will hear these are decorative so they know they aren't missing any important information.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      isDecorative?: boolean;
      /**
       * For EACH ITEM in the collection: The distance, in points, from the left side of the shape to the left side of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      left?: boolean;
      /**
             * For EACH ITEM in the collection: Returns the level of the specified shape.
                        
                        - A level of 0 means the shape isn't part of a group.
                        
                        - A level of 1 means the shape is part of a top-level group.
                        
                        - A level greater than 1 indicates the shape is a nested group.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      level?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the name of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      name?: boolean;
      /**
             * For EACH ITEM in the collection: Specifies the rotation, in degrees, of the shape around the z-axis.
                        A positive value indicates clockwise rotation, and a negative value indicates counterclockwise rotation.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      rotation?: boolean;
      /**
       * For EACH ITEM in the collection: The distance, in points, from the top edge of the shape to the top edge of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      top?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the type of this shape. See {@link PowerPoint.ShapeType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      type?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies if the shape is visible.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      visible?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the width, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      width?: boolean;
      /**
             * For EACH ITEM in the collection: Returns the z-order position of the shape, with 0 representing the bottom of the order stack. Every shape on a slide has a unique z-order, but
                        each slide also has a unique z-order stack, so two shapes on separate slides could have the same z-order number.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      zOrderPosition?: boolean;
    }
    /**
     * Represents the properties for a table cell border.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    export interface BorderLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Represents the line color in the hexadecimal format #RRGGBB (e.g., "FFA500") or as a named HTML color value (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      color?: boolean;
      /**
       * Represents the dash style of the line.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      dashStyle?: boolean;
      /**
       * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      transparency?: boolean;
      /**
       * Represents the weight of the line, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      weight?: boolean;
    }
    /**
     * Represents the borders for a table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    export interface BordersLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Gets the bottom border.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      bottom?: PowerPoint.Interfaces.BorderLoadOptions;
      /**
       * Gets the diagonal border (top-left to bottom-right).
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      diagonalDown?: PowerPoint.Interfaces.BorderLoadOptions;
      /**
       * Gets the diagonal border (bottom-left to top-right).
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      diagonalUp?: PowerPoint.Interfaces.BorderLoadOptions;
      /**
       * Gets the left border.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      left?: PowerPoint.Interfaces.BorderLoadOptions;
      /**
       * Gets the right border.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      right?: PowerPoint.Interfaces.BorderLoadOptions;
      /**
       * Gets the top border.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      top?: PowerPoint.Interfaces.BorderLoadOptions;
    }
    /**
     * Represents the margins of a table cell.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    export interface MarginsLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies the bottom margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      bottom?: boolean;
      /**
       * Specifies the left margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      left?: boolean;
      /**
       * Specifies the right margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      right?: boolean;
      /**
       * Specifies the top margin in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      top?: boolean;
    }
    /**
     * Represents the fill formatting of a shape object.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    export interface ShapeFillLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Represents the shape fill foreground color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      foregroundColor?: boolean;
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear). Returns `null` if the shape type doesn't support transparency or the shape fill has inconsistent transparency, such as with a gradient fill type.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      transparency?: boolean;
      /**
       * Returns the fill type of the shape. See {@link PowerPoint.ShapeFillType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      type?: boolean;
    }
    /**
     * Represents a table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    export interface TableCellLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Gets the collection of borders for the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      borders?: PowerPoint.Interfaces.BordersLoadOptions;
      /**
       * Gets the fill color of the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      fill?: PowerPoint.Interfaces.ShapeFillLoadOptions;
      /**
       * Gets the font of the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      font?: PowerPoint.Interfaces.ShapeFontLoadOptions;
      /**
       * Gets the set of margins in the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      margins?: PowerPoint.Interfaces.MarginsLoadOptions;
      /**
             * Gets the number of table columns this cell spans across.
                        Will be greater than or equal to 1.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      columnCount?: boolean;
      /**
       * Gets the zero-based column index of the cell within the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      columnIndex?: boolean;
      /**
       * Specifies the horizontal alignment of the text in the table cell. Returns `null` if the cell text contains different alignments.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      horizontalAlignment?: boolean;
      /**
       * Specifies the indent level of the text in the table cell. Returns `null` if the cell text contains different indent levels.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      indentLevel?: boolean;
      /**
             * Gets the number of table rows this cell spans across.
                        Will be greater than or equal to 1.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      rowCount?: boolean;
      /**
       * Gets the zero-based row index of the cell within the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      rowIndex?: boolean;
      /**
       * Specifies the text content of the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      text?: boolean;
      /**
             * Specifies the contents of the table cell as an array of {@link PowerPoint.TextRun} objects.
                        Each `TextRun` object represents a sequence of one or more characters that share the same font attributes.
             *
             * @remarks
             * [Api set: PowerPointApi 1.9]
             */
      textRuns?: boolean;
      /**
       * Specifies the vertical alignment of the text in the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      verticalAlignment?: boolean;
    }
    /**
     * Represents a collection of table cells.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    export interface TableCellCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the collection of borders for the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      borders?: PowerPoint.Interfaces.BordersLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the fill color of the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      fill?: PowerPoint.Interfaces.ShapeFillLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the font of the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      font?: PowerPoint.Interfaces.ShapeFontLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the set of margins in the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      margins?: PowerPoint.Interfaces.MarginsLoadOptions;
      /**
             * For EACH ITEM in the collection: Gets the number of table columns this cell spans across.
                        Will be greater than or equal to 1.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      columnCount?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the zero-based column index of the cell within the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      columnIndex?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the horizontal alignment of the text in the table cell. Returns `null` if the cell text contains different alignments.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      horizontalAlignment?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the indent level of the text in the table cell. Returns `null` if the cell text contains different indent levels.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      indentLevel?: boolean;
      /**
             * For EACH ITEM in the collection: Gets the number of table rows this cell spans across.
                        Will be greater than or equal to 1.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      rowCount?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the zero-based row index of the cell within the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      rowIndex?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the text content of the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      text?: boolean;
      /**
             * For EACH ITEM in the collection: Specifies the contents of the table cell as an array of {@link PowerPoint.TextRun} objects.
                        Each `TextRun` object represents a sequence of one or more characters that share the same font attributes.
             *
             * @remarks
             * [Api set: PowerPointApi 1.9]
             */
      textRuns?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the vertical alignment of the text in the table cell.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      verticalAlignment?: boolean;
    }
    /**
     * Represents a column in a table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    export interface TableColumnLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns the index number of the column within the column collection of the table. Zero-indexed.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      columnIndex?: boolean;
      /**
       * Retrieves the width of the column in points. If the set column width is less than the minimum width, the column width will be increased to the minimum width.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      width?: boolean;
    }
    /**
     * Represents a collection of table columns.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    export interface TableColumnCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the index number of the column within the column collection of the table. Zero-indexed.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      columnIndex?: boolean;
      /**
       * For EACH ITEM in the collection: Retrieves the width of the column in points. If the set column width is less than the minimum width, the column width will be increased to the minimum width.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      width?: boolean;
    }
    /**
     * Represents a row in a table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    export interface TableRowLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Retrieves the current height of the row in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      currentHeight?: boolean;
      /**
       * Specifies the height of the row in points. If the set row height is less than the minimum height, the row height will be increased to the minimum height.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      height?: boolean;
      /**
       * Returns the index number of the row within the rows collection of the table. Zero-indexed.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      rowIndex?: boolean;
    }
    /**
     * Represents a collection of table rows.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    export interface TableRowCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Retrieves the current height of the row in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      currentHeight?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the height of the row in points. If the set row height is less than the minimum height, the row height will be increased to the minimum height.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      height?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the index number of the row within the rows collection of the table. Zero-indexed.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      rowIndex?: boolean;
    }
    /**
     * Represents the available table style settings.
     *
     * @remarks
     * [Api set: PowerPointApi 1.9]
     */
    export interface TableStyleSettingsLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies if the columns show banded formatting in which odd columns are highlighted differently from even ones, to make reading the table easier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      areColumnsBanded?: boolean;
      /**
       * Specifies if the rows show banded formatting in which odd rows are highlighted differently from even ones, to make reading the table easier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      areRowsBanded?: boolean;
      /**
       * Specifies if the first column contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isFirstColumnHighlighted?: boolean;
      /**
       * Specifies if the first row contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isFirstRowHighlighted?: boolean;
      /**
       * Specifies if the last column contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isLastColumnHighlighted?: boolean;
      /**
       * Specifies if the last row contains special formatting.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      isLastRowHighlighted?: boolean;
      /**
       * Specifies the table style.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      style?: boolean;
    }
    /**
     * Represents a table.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    export interface TableLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Gets the table style settings.
       *
       * @remarks
       * [Api set: PowerPointApi 1.9]
       */
      styleSettings?: PowerPoint.Interfaces.TableStyleSettingsLoadOptions;
      /**
       * Gets the number of columns in the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      columnCount?: boolean;
      /**
       * Gets the number of rows in the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      rowCount?: boolean;
      /**
       * Gets all of the values in the table.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      values?: boolean;
    }
    /**
     * Represents the collection of shapes.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    export interface ShapeCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Returns an `Adjustments` object that contains adjustment values for all the adjustments in this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      adjustments?: PowerPoint.Interfaces.AdjustmentsLoadOptions;
      /**
       * For EACH ITEM in the collection: Returns the fill formatting of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      fill?: PowerPoint.Interfaces.ShapeFillLoadOptions;
      /**
            * For EACH ITEM in the collection: Returns the `ShapeGroup` associated with the shape.
            If the shape type isn't `group`, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      group?: PowerPoint.Interfaces.ShapeGroupLoadOptions;
      /**
       * For EACH ITEM in the collection: Returns the line formatting of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      lineFormat?: PowerPoint.Interfaces.ShapeLineFormatLoadOptions;
      /**
            * For EACH ITEM in the collection: Returns the parent group of this shape.
            If the shape isn't part of a group, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      parentGroup?: PowerPoint.Interfaces.ShapeLoadOptions;
      /**
            * For EACH ITEM in the collection: Returns the properties that apply specifically to this placeholder.
            If the shape type isn't `placeholder`, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      placeholderFormat?: PowerPoint.Interfaces.PlaceholderFormatLoadOptions;
      /**
       * For EACH ITEM in the collection: Returns the {@link PowerPoint.TextFrame} object of this `Shape`. Throws an `InvalidArgument` exception if the shape doesn't support a `TextFrame`.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      textFrame?: PowerPoint.Interfaces.TextFrameLoadOptions;
      /**
             * For EACH ITEM in the collection: The alt text description of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextDescription?: boolean;
      /**
             * For EACH ITEM in the collection: The alt text title of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
                        A title can be read to a person with a disability and is used to determine whether they wish to hear the description of the content.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextTitle?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the creation ID of the shape. Returns `null` if the shape has no creation ID.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      creationId?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the height, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      height?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the unique ID of the shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: boolean;
      /**
             * For EACH ITEM in the collection: Represents whether the shape is decorative or not.
                        
                        Decorative objects add visual interest but aren't informative (e.g. stylistic borders).
                        People using screen readers will hear these are decorative so they know they aren't missing any important information.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      isDecorative?: boolean;
      /**
       * For EACH ITEM in the collection: The distance, in points, from the left side of the shape to the left side of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      left?: boolean;
      /**
             * For EACH ITEM in the collection: Returns the level of the specified shape.
                        
                        - A level of 0 means the shape isn't part of a group.
                        
                        - A level of 1 means the shape is part of a top-level group.
                        
                        - A level greater than 1 indicates the shape is a nested group.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      level?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the name of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      name?: boolean;
      /**
             * For EACH ITEM in the collection: Specifies the rotation, in degrees, of the shape around the z-axis.
                        A positive value indicates clockwise rotation, and a negative value indicates counterclockwise rotation.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      rotation?: boolean;
      /**
       * For EACH ITEM in the collection: The distance, in points, from the top edge of the shape to the top edge of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      top?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the type of this shape. See {@link PowerPoint.ShapeType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      type?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies if the shape is visible.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      visible?: boolean;
      /**
       * For EACH ITEM in the collection: Specifies the width, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      width?: boolean;
      /**
             * For EACH ITEM in the collection: Returns the z-order position of the shape, with 0 representing the bottom of the order stack. Every shape on a slide has a unique z-order, but
                        each slide also has a unique z-order stack, so two shapes on separate slides could have the same z-order number.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      zOrderPosition?: boolean;
    }
    /**
     * Represents {@link PowerPoint.SlideBackground} gradient fill properties.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface SlideBackgroundGradientFillLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies the type of gradient fill.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?: boolean;
    }
    /**
     * Represents {@link PowerPoint.SlideBackground} pattern fill properties.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface SlideBackgroundPatternFillLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies the background color in HTML color format (e.g., "#FFFFFF" or "white").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      backgroundColor?: boolean;
      /**
       * Specifies the foreground color in HTML color format (e.g., "#FFA500" or "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      foregroundColor?: boolean;
      /**
       * Specifies the pattern type.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      pattern?: boolean;
    }
    /**
     * Represents {@link PowerPoint.SlideBackground} picture or texture fill properties.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface SlideBackgroundPictureOrTextureFillLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      transparency?: boolean;
    }
    /**
     * Represents {@link PowerPoint.SlideBackground} solid fill properties.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface SlideBackgroundSolidFillLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies the fill color in HTML color format (e.g., "#FFA500" or "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      color?: boolean;
      /**
       * Specifies the transparency percentage of the fill as a value from 0.0 (opaque) through 1.0 (clear).
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      transparency?: boolean;
    }
    /**
     * Represents the fill formatting of a slide background object.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface SlideBackgroundFillLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns the fill type of the slide background. See {@link PowerPoint.SlideBackgroundFillType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      type?: boolean;
    }
    /**
     * Represents a background of a slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface SlideBackgroundLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns the fill formatting of the background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      fill?: PowerPoint.Interfaces.SlideBackgroundFillLoadOptions;
      /**
       * Specifies whether the slide layout background fill hides or displays background graphic objects from the slide master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      areBackgroundGraphicsHidden?: boolean;
      /**
       * Specifies if the slide background follows the slide master background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      isMasterBackgroundFollowed?: boolean;
    }
    /**
     * Represents the background of a slide layout.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface SlideLayoutBackgroundLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns the fill formatting of the background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      fill?: PowerPoint.Interfaces.SlideBackgroundFillLoadOptions;
      /**
       * Specifies whether the slide layout background fill hides or displays background graphic objects from the slide master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      areBackgroundGraphicsHidden?: boolean;
      /**
       * Specifies if the slide layout background follows the slide master background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      isMasterBackgroundFollowed?: boolean;
    }
    /**
     * Represents the layout of a slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    export interface SlideLayoutLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Gets the background of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      background?: PowerPoint.Interfaces.SlideLayoutBackgroundLoadOptions;
      /**
       * Gets the unique ID of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: boolean;
      /**
       * Gets the name of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      name?: boolean;
      /**
       * Returns the type of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      type?: boolean;
    }
    /**
     * Represents the collection of layouts provided by the Slide Master for slides.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    export interface SlideLayoutCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the background of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      background?: PowerPoint.Interfaces.SlideLayoutBackgroundLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the unique ID of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the name of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      name?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the type of the slide layout.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      type?: boolean;
    }
    /**
     * Represents the background of a slide master.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface SlideMasterBackgroundLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns the fill formatting of the background.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      fill?: PowerPoint.Interfaces.SlideBackgroundFillLoadOptions;
    }
    /**
     * Represents the Slide Master of a slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    export interface SlideMasterLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Gets the background of the Slide Master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      background?: PowerPoint.Interfaces.SlideMasterBackgroundLoadOptions;
      /**
       * Gets the unique ID of the Slide Master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: boolean;
      /**
       * Gets the unique name of the Slide Master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      name?: boolean;
    }
    /**
     * Represents a single tag in the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    export interface TagLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Gets the unique ID of the tag. The `key` is unique within the owning `TagCollection` and always stored as uppercase letters within the document.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      key?: boolean;
      /**
       * Gets the value of the tag.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      value?: boolean;
    }
    /**
     * Represents the collection of tags.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    export interface TagCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the unique ID of the tag. The `key` is unique within the owning `TagCollection` and always stored as uppercase letters within the document.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      key?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the value of the tag.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      value?: boolean;
    }
    /**
     * Represents a single slide of a presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.2]
     */
    export interface SlideLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Gets the background of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      background?: PowerPoint.Interfaces.SlideBackgroundLoadOptions;
      /**
       * Gets the layout of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      layout?: PowerPoint.Interfaces.SlideLayoutLoadOptions;
      /**
       * Gets the `SlideMaster` object that represents the slide's default content.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      slideMaster?: PowerPoint.Interfaces.SlideMasterLoadOptions;
      /**
       * Gets the unique ID of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.2]
       */
      id?: boolean;
      /**
       * Returns the zero-based index of the slide representing its position in the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      index?: boolean;
    }
    /**
     * Represents a shape group inside a presentation. To get the corresponding Shape object, use `ShapeGroup.shape`.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    export interface ShapeGroupLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns the `Shape` object associated with the group.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      shape?: PowerPoint.Interfaces.ShapeLoadOptions;
      /**
       * Gets the creation ID of the shape group. Returns `null` if the shape group has no creation ID.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      creationId?: boolean;
      /**
       * Gets the unique ID of the shape group.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      id?: boolean;
    }
    /**
     * Represents the line formatting for the shape object. For images and geometric shapes, line formatting represents the border of the shape.
     *
     * @remarks
     * [Api set: PowerPointApi 1.4]
     */
    export interface ShapeLineFormatLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Represents the line color in HTML color format, in the form #RRGGBB (e.g., "FFA500") or as a named HTML color (e.g., "orange").
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      color?: boolean;
      /**
       * Represents the dash style of the line. Returns null when the line isn't visible or there are inconsistent dash styles. See {@link PowerPoint.ShapeLineDashStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      dashStyle?: boolean;
      /**
       * Represents the line style of the shape. Returns null when the line isn't visible or there are inconsistent styles. See {@link PowerPoint.ShapeLineStyle} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      style?: boolean;
      /**
       * Specifies the transparency percentage of the line as a value from 0.0 (opaque) through 1.0 (clear). Returns null when the shape has inconsistent transparencies.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      transparency?: boolean;
      /**
       * Specifies if the line formatting of a shape element is visible. Returns `null` when the shape has inconsistent visibilities.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      visible?: boolean;
      /**
       * Represents the weight of the line, in points. Returns `null` when the line isn't visible or there are inconsistent line weights.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      weight?: boolean;
    }
    /**
     * Represents a single shape in the slide.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    export interface ShapeLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Returns an `Adjustments` object that contains adjustment values for all the adjustments in this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      adjustments?: PowerPoint.Interfaces.AdjustmentsLoadOptions;
      /**
       * Returns the fill formatting of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      fill?: PowerPoint.Interfaces.ShapeFillLoadOptions;
      /**
            * Returns the `ShapeGroup` associated with the shape.
            If the shape type isn't `group`, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      group?: PowerPoint.Interfaces.ShapeGroupLoadOptions;
      /**
       * Returns the line formatting of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      lineFormat?: PowerPoint.Interfaces.ShapeLineFormatLoadOptions;
      /**
            * Returns the parent group of this shape.
            If the shape isn't part of a group, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      parentGroup?: PowerPoint.Interfaces.ShapeLoadOptions;
      /**
            * Returns the properties that apply specifically to this placeholder.
            If the shape type isn't `placeholder`, then this method returns the `GeneralException` error.
            *
            * @remarks
            * [Api set: PowerPointApi 1.8]
            */
      placeholderFormat?: PowerPoint.Interfaces.PlaceholderFormatLoadOptions;
      /**
       * Returns the {@link PowerPoint.TextFrame} object of this `Shape`. Throws an `InvalidArgument` exception if the shape doesn't support a `TextFrame`.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      textFrame?: PowerPoint.Interfaces.TextFrameLoadOptions;
      /**
             * The alt text description of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextDescription?: boolean;
      /**
             * The alt text title of the Shape.
                        
                        Alt text provides alternative, text-based representations of the information contained in the Shape.
                        This information is useful for people with vision or cognitive impairments who may not be able to see or understand the shape.
                        A title can be read to a person with a disability and is used to determine whether they wish to hear the description of the content.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      altTextTitle?: boolean;
      /**
       * Gets the creation ID of the shape. Returns `null` if the shape has no creation ID.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      creationId?: boolean;
      /**
       * Specifies the height, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      height?: boolean;
      /**
       * Gets the unique ID of the shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: boolean;
      /**
             * Represents whether the shape is decorative or not.
                        
                        Decorative objects add visual interest but aren't informative (e.g. stylistic borders).
                        People using screen readers will hear these are decorative so they know they aren't missing any important information.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      isDecorative?: boolean;
      /**
       * The distance, in points, from the left side of the shape to the left side of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      left?: boolean;
      /**
             * Returns the level of the specified shape.
                        
                        - A level of 0 means the shape isn't part of a group.
                        
                        - A level of 1 means the shape is part of a top-level group.
                        
                        - A level greater than 1 indicates the shape is a nested group.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      level?: boolean;
      /**
       * Specifies the name of this shape.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      name?: boolean;
      /**
             * Specifies the rotation, in degrees, of the shape around the z-axis.
                        A positive value indicates clockwise rotation, and a negative value indicates counterclockwise rotation.
             *
             * @remarks
             * [Api set: PowerPointApi 1.10]
             */
      rotation?: boolean;
      /**
       * The distance, in points, from the top edge of the shape to the top edge of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      top?: boolean;
      /**
       * Returns the type of this shape. See {@link PowerPoint.ShapeType} for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      type?: boolean;
      /**
       * Specifies if the shape is visible.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      visible?: boolean;
      /**
       * Specifies the width, in points, of the shape. Throws an `InvalidArgument` exception when set with a negative value.
       *
       * @remarks
       * [Api set: PowerPointApi 1.4]
       */
      width?: boolean;
      /**
             * Returns the z-order position of the shape, with 0 representing the bottom of the order stack. Every shape on a slide has a unique z-order, but
                        each slide also has a unique z-order stack, so two shapes on separate slides could have the same z-order number.
             *
             * @remarks
             * [Api set: PowerPointApi 1.8]
             */
      zOrderPosition?: boolean;
    }
    /**
     * Represents an Office.js binding that is defined in the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    export interface BindingLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Represents the binding identifier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      id?: boolean;
      /**
       * Returns the type of the binding. See `BindingType` for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      type?: boolean;
    }
    /**
     * Represents the collection of all the binding objects that are part of the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.8]
     */
    export interface BindingCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Represents the binding identifier.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      id?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the type of the binding. See `BindingType` for details.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      type?: boolean;
    }
    /**
     * Represents a custom property.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    export interface CustomPropertyLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * The string that uniquely identifies the custom property.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      key?: boolean;
      /**
       * The type of the value used for the custom property.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      type?: boolean;
      /**
             * The value of the custom property.
                        If the value is a string, the maximum length 255 characters. Larger strings cause the operation to fail with an `InvalidArgument` error.
             *
             * @remarks
             * [Api set: PowerPointApi 1.7]
             */
      value?: boolean;
    }
    /**
     * A collection of custom properties.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    export interface CustomPropertyCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: The string that uniquely identifies the custom property.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      key?: boolean;
      /**
       * For EACH ITEM in the collection: The type of the value used for the custom property.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      type?: boolean;
      /**
             * For EACH ITEM in the collection: The value of the custom property.
                        If the value is a string, the maximum length 255 characters. Larger strings cause the operation to fail with an `InvalidArgument` error.
             *
             * @remarks
             * [Api set: PowerPointApi 1.7]
             */
      value?: boolean;
    }
    /**
     * Represents presentation properties.
     *
     * @remarks
     * [Api set: PowerPointApi 1.7]
     */
    export interface DocumentPropertiesLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * The author of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      author?: boolean;
      /**
       * The category of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      category?: boolean;
      /**
       * The Comments field in the metadata of the presentation. These have no connection to comments made in slides.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      comments?: boolean;
      /**
       * The company of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      company?: boolean;
      /**
       * The creation date of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      creationDate?: boolean;
      /**
       * The keywords of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      keywords?: boolean;
      /**
       * The last author of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      lastAuthor?: boolean;
      /**
       * The manager of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      manager?: boolean;
      /**
       * The revision number of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      revisionNumber?: boolean;
      /**
       * The subject of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      subject?: boolean;
      /**
       * The title of the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.7]
       */
      title?: boolean;
    }
    /**
     * Represents the page setup information for the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.10]
     */
    export interface PageSetupLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * Specifies the height of the slides in the presentation, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      slideHeight?: boolean;
      /**
       * Specifies the width of the slides in the presentation, in points.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      slideWidth?: boolean;
    }
    /**
     * Represents the collection of slides in the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.2]
     */
    export interface SlideCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the background of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      background?: PowerPoint.Interfaces.SlideBackgroundLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the layout of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      layout?: PowerPoint.Interfaces.SlideLayoutLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the `SlideMaster` object that represents the slide's default content.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      slideMaster?: PowerPoint.Interfaces.SlideMasterLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the unique ID of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.2]
       */
      id?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the zero-based index of the slide representing its position in the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      index?: boolean;
    }
    /**
     * Represents a collection of slides in the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.5]
     */
    export interface SlideScopedCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the background of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      background?: PowerPoint.Interfaces.SlideBackgroundLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the layout of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.5]
       */
      layout?: PowerPoint.Interfaces.SlideLayoutLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the `SlideMaster` object that represents the slide's default content.
       *
       * @remarks
       * [Api set: PowerPointApi 1.5]
       */
      slideMaster?: PowerPoint.Interfaces.SlideMasterLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the unique ID of the slide.
       *
       * @remarks
       * [Api set: PowerPointApi 1.2]
       */
      id?: boolean;
      /**
       * For EACH ITEM in the collection: Returns the zero-based index of the slide representing its position in the presentation.
       *
       * @remarks
       * [Api set: PowerPointApi 1.8]
       */
      index?: boolean;
    }
    /**
     * Represents the collection of Slide Masters in the presentation.
     *
     * @remarks
     * [Api set: PowerPointApi 1.3]
     */
    export interface SlideMasterCollectionLoadOptions {
      /**
              Specifying `$all` for the load options loads all the scalar properties (such as `Range.address`) but not the navigational properties (such as `Range.format.fill.color`).
             */
      $all?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the background of the Slide Master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.10]
       */
      background?: PowerPoint.Interfaces.SlideMasterBackgroundLoadOptions;
      /**
       * For EACH ITEM in the collection: Gets the unique ID of the Slide Master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      id?: boolean;
      /**
       * For EACH ITEM in the collection: Gets the unique name of the Slide Master.
       *
       * @remarks
       * [Api set: PowerPointApi 1.3]
       */
      name?: boolean;
    }
  }
}
export declare namespace PowerPoint {
  /**
   * The RequestContext object facilitates requests to the PowerPoint application. Since the Office add-in and the PowerPoint application run in two different processes, the request context is required to get access to the PowerPoint object model from the add-in.
   */
  export class RequestContext extends OfficeExtension.ClientRequestContext {
    constructor(url?: string);
    readonly presentation: Presentation;
    readonly application: Application;
  }
  /**
   * Executes a batch script that performs actions on the PowerPoint object model, using a new RequestContext. When the promise is resolved, any tracked objects that were automatically allocated during execution will be released.
   * @param batch - A function that takes in a RequestContext and returns a promise (typically, just the result of "context.sync()"). The context parameter facilitates requests to the PowerPoint application. Since the Office add-in and the PowerPoint application run in two different processes, the RequestContext is required to get access to the PowerPoint object model from the add-in.
   */
  export function run<T>(
    batch: (context: PowerPoint.RequestContext) => OfficeExtension.IPromise<T>,
  ): OfficeExtension.IPromise<T>;
  /**
   * Executes a batch script that performs actions on the PowerPoint object model, using the RequestContext of a previously-created API object. When the promise is resolved, any tracked objects that were automatically allocated during execution will be released.
   * @param object - A previously-created API object. The batch will use the same RequestContext as the passed-in object, which means that any changes applied to the object will be picked up by "context.sync()".
   * @param batch - A function that takes in a RequestContext and returns a promise (typically, just the result of "context.sync()"). The context parameter facilitates requests to the PowerPoint application. Since the Office add-in and the PowerPoint application run in two different processes, the RequestContext is required to get access to the PowerPoint object model from the add-in.
   */
  export function run<T>(
    object: OfficeExtension.ClientObject,
    batch: (context: PowerPoint.RequestContext) => OfficeExtension.IPromise<T>,
  ): OfficeExtension.IPromise<T>;
  /**
   * Executes a batch script that performs actions on the PowerPoint object model, using the RequestContext of previously-created API objects.
   * @param objects - An array of previously-created API objects. The array will be validated to make sure that all of the objects share the same context. The batch will use this shared RequestContext, which means that any changes applied to these objects will be picked up by "context.sync()".
   * @param batch - A function that takes in a RequestContext and returns a promise (typically, just the result of "context.sync()"). The context parameter facilitates requests to the PowerPoint application. Since the Office add-in and the PowerPoint application run in two different processes, the RequestContext is required to get access to the PowerPoint object model from the add-in.
   */
  export function run<T>(
    objects: OfficeExtension.ClientObject[],
    batch: (context: PowerPoint.RequestContext) => OfficeExtension.IPromise<T>,
  ): OfficeExtension.IPromise<T>;
}
export declare namespace PowerPoint {
  /**
   * Creates and opens a new presentation. Optionally, the presentation can be prepopulated with a Base64-encoded .pptx file.
   *
   * [Api set: PowerPointApi 1.1]
   *
   * @param base64File - Optional. The Base64-encoded .pptx file. The default value is null. The maximum length of the string is 71,680,000 characters.
   */
  export function createPresentation(base64File?: string): Promise<void>;
}

////////////////////////////////////////////////////////////////
///////////////////// End PowerPoint APIs //////////////////////
////////////////////////////////////////////////////////////////
