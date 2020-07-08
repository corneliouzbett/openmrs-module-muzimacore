package org.openmrs.module.muzima.htmlform2MuzimaTransform.formField;

import java.util.Locale;

import org.openmrs.Concept;

/**
 * generates html code for radio button {@code <input type="radio"/>}
 */

public class RadioButtonsField extends SingleOptionField {
	
	private String fieldLabel;
	private String name;
	private String dataConcept;
	private boolean required = false;
	private String answerSeparator = null;
	private String js = null;
	
	/**
	 * Default Constructor
	 */
	public RadioButtonsField() {
		super();
	}
	
	public RadioButtonsField(Concept concept, Locale locale, String label) {
		this.setName(FieldFactory.createNameAttributeFromConcept(concept, locale));
		this.setDataConcept(FieldFactory.createDataConceptAttributeFromConcept(concept, locale));
		this.fieldLabel = label;
	}
	
	@Override
	public String generateHtml() {
		StringBuilder sb = new StringBuilder();
		sb.append("\n<div class=\"form-group\">\n"
				+"			<div class=\"form-group\">\n"
				+"				<span><strong>" + this.fieldLabel);
		if (this.required) {
			sb.append(" <span class=\"required\">*</span>");
		}
		sb.append(" </strong></span> \n");
		
		for (int i = 0; i < getOptions().size(); ++i) {
			Option option = getOptions().get(i);
			boolean selected = option.isSelected();
			if (!selected)
				selected = getDefaultValue() == null ? option.getValue().equals("")
				        : getDefaultValue().equals(option.getValue());
			sb.append(" 		<div class=\"radio\">\n"
					+ "            <label for=\""+this.name.concat(String.valueOf(i))+"\" style=\"font-weight: normal;\">\n"
					+ "                <input name=\"" + this.name + "\" id=\""+this.name.concat(String.valueOf(i))+"\" type=\"radio\" data-concept=\"" + this.dataConcept + "\"\n"
			        + "                       value=\"" + option.getValue() + "\">\n" + option.getLabel() + "\n"
			        + "            </label>\n"
					+ "         </div>");
			if (i < getOptions().size() - 1) {
				sb.append(getAnswerSeparator());
			}
		}
		
		sb.append(" </div>\r\n"
				+ "</div>");
		return sb.toString();
	}
	
	@Override
	public String getJs() {
		if (this.js != null) {
			return this.js;
		}
		return "";
	}
	
	@Override
	public void setRequired(boolean required) {
		this.required = required;
	}
	
	@Override
	public boolean isRequired() {
		return required;
	}
	
	/**
	 * @return the answerSeparator
	 */
	public String getAnswerSeparator() {
		if (answerSeparator == null)
			answerSeparator = "&#160;";
		return answerSeparator;
	}
	
	/**
	 * @param answerSeparator the answerSeparator to set
	 */
	public void setAnswerSeparator(String answerSeparator) {
		this.answerSeparator = answerSeparator;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getDataConcept() {
		return dataConcept;
	}
	
	public void setDataConcept(String dataConcept) {
		this.dataConcept = dataConcept;
	}
	
	
}
