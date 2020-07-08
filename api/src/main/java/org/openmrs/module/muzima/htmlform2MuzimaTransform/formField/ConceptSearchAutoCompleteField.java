package org.openmrs.module.muzima.htmlform2MuzimaTransform.formField;

import java.util.List;
import java.util.Locale;

import org.openmrs.Concept;
import org.openmrs.ConceptClass;
import org.openmrs.api.context.Context;
import org.openmrs.module.muzima.htmlform2MuzimaTransform.Htmlform2MuzimaTransformUtil;

public class ConceptSearchAutoCompleteField implements FormField {
	private Option defaultValue;
	private String allowedConceptIds;
	private String allowedConceptClassNames;
	private String allowedConceptSetIds;
	private String src;
	private static String defaultSrc = "conceptSearch.form";
	private String fieldLabel;
	private String name;
	private String dataConcept;
	private boolean required = false;
	private String js = null;
	private String sourceVariableName;
	private String autoCompleteSourceArray;
	
	public ConceptSearchAutoCompleteField(Concept concept, Locale locale, String label, List<Concept> conceptList,
	    List<ConceptClass> allowedconceptclasses, String src) {
		this.name = FieldFactory.createNameAttributeFromConcept(concept, locale);
		this.dataConcept = FieldFactory.createDataConceptAttributeFromConcept(concept, locale);
		this.fieldLabel = label;
		this.src = src;
		this.sourceVariableName = Htmlform2MuzimaTransformUtil.toCamelCase(this.fieldLabel) + "Source";
		StringBuilder autoCompleteSource = new StringBuilder();
		
		autoCompleteSource.append("var " + this.sourceVariableName + " = [ \n");
		//only 1 of them is used to specify the filter
		if (allowedconceptclasses == null || allowedconceptclasses.size() == 0) {
			if (conceptList != null) {
				for (Concept conc : conceptList) {
					Option option = new Option(conc, locale);
					autoCompleteSource
					        .append("{\"label\": \"" + option.getLabel() + "\", \" val\": \"" + option.getValue() + "\"},");
				}
			}
		} else {
			for (ConceptClass conceptClass : allowedconceptclasses) {
				try {
					List<Concept> cncptList = Context.getConceptService().getConceptsByClass(conceptClass);
					for (Concept conc : cncptList) {
						Option option = new Option(conc, locale);
						autoCompleteSource.append(
							"{\"label\": \"" + option.getLabel() + "\", \" val\": \"" + option.getValue() + "\"},");
					}
				}
				catch (Exception e) {
					throw new RuntimeException(
							"Error in answer class list for concept class: " + conceptClass + " (" + e.toString());
				}
			}

		}
		
		autoCompleteSource.append("];\r\n");
		this.autoCompleteSourceArray = autoCompleteSource.toString();
	}
	
	public ConceptSearchAutoCompleteField(Concept concept, Locale locale, String label, List<Concept> conceptList,
	    List<ConceptClass> allowedconceptclasses) {
		this(concept, locale, label, conceptList, allowedconceptclasses, defaultSrc);
	}
	
	@Override
	public String generateHtml() {
		StringBuilder sb = new StringBuilder();
		
		sb.append("\n<div class=\"form-group\">\n"
				+ "    <label for=\"" + this.name + "\">" + this.fieldLabel);
		if (this.required) {
			sb.append(" <span class=\"required\">*</span>");
		}
		sb.append(" </label>\n"
				+ "    <input class=\"form-control\" id=\"" + this.name + "\" type=\"text\" data-concept=\""
		        + this.dataConcept + "\" placeholder=\"Start typing something...\"");
		if (defaultValue != null) {
			sb.append(" value=\"" + defaultValue.getLabel() + "\"");
		}
		sb.append("/>\n");
		sb.append("<input class=\"form-control\" name=\"" + this.name + "\" type=\"hidden\"");
		if (defaultValue != null) {
			sb.append(" value=\"" + defaultValue.getValue() + "\"");
		}
		sb.append(">\n </div>");
		setJs();
		return sb.toString();
		
	}
	
	/**
	 * defaultValue parameter here must be an Option Object, as Option(concept, locale)
	 */
	@Override
	public void setDefaultValue(Object defaultValue) {
		this.defaultValue = (Option) defaultValue;
		
	}
	
	public void setJs() {
		String elementName = FieldFactory.escapeJs(this.name);
		String valueName = this.name.replaceAll("\\.", "_");
		String js = "\n"
				+ autoCompleteSourceArray
				+ "\n    $('#" + elementName + "').autocomplete({\n"
		        + "        source: " + sourceVariableName + ",\n"
				+ "        create: function (event, ui) {\n"
		        + "            var " + valueName + "_val = $('input[name=\"" + elementName + "\"]').val();\n"
		        + "            $.each(" + sourceVariableName + ", function (i, elem) {\n"
		        + "                if (elem.val == " + valueName + "_val" + ") {\n"
				+ "                    $('#" + elementName + "').val(elem.label)\n"
				+ "                }\n"
				+ "                ;\n"
		        + "            });\n"
				+ "        },\n"
				+ "        select: function (event, ui) {\n"
		        + "            $('input[name=\"" + elementName + "\"]').val(ui.item.val);\n"
				+ "            $('#" + elementName + "').val(ui.item.label);\n"
				+ "            return false;\n"
				+ "        }\n"
				+ "    });";
		this.js = js;
	}
	
	@Override
	public String getJs() {
		if (this.js != null) {
			return this.js;
		}
		return "";
	}
	
	//TODO handle AllowedConceptSetIds
	public void setAllowedConceptSetIds(String allowedConceptSetIds) {
		this.allowedConceptSetIds = allowedConceptSetIds;
	}
	
	@Override
	public void setRequired(boolean required) {
		this.required = required;
	}
	
	@Override
	public boolean isRequired() {
		return required;
	}
}
