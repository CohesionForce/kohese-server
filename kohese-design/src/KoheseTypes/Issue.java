/**
 */
package KoheseTypes;


/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Issue</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link KoheseTypes.Issue#getResolution <em>Resolution</em>}</li>
 *   <li>{@link KoheseTypes.Issue#getAnalysis <em>Analysis</em>}</li>
 * </ul>
 *
 * @see KoheseTypes.KoheseTypesPackage#getIssue()
 * @model
 * @generated
 */
public interface Issue extends Observation {

	/**
	 * Returns the value of the '<em><b>Resolution</b></em>' reference.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Resolution</em>' reference isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Resolution</em>' reference.
	 * @see #setResolution(Action)
	 * @see KoheseTypes.KoheseTypesPackage#getIssue_Resolution()
	 * @model
	 * @generated
	 */
	Action getResolution();

	/**
	 * Sets the value of the '{@link KoheseTypes.Issue#getResolution <em>Resolution</em>}' reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Resolution</em>' reference.
	 * @see #getResolution()
	 * @generated
	 */
	void setResolution(Action value);

	/**
	 * Returns the value of the '<em><b>Analysis</b></em>' reference.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Analysis</em>' reference isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Analysis</em>' reference.
	 * @see #setAnalysis(Action)
	 * @see KoheseTypes.KoheseTypesPackage#getIssue_Analysis()
	 * @model
	 * @generated
	 */
	Action getAnalysis();

	/**
	 * Sets the value of the '{@link KoheseTypes.Issue#getAnalysis <em>Analysis</em>}' reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Analysis</em>' reference.
	 * @see #getAnalysis()
	 * @generated
	 */
	void setAnalysis(Action value);
} // Issue
